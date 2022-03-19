########################################
#
#   BUILDING
#
# 	Build debug server and run
# 	$ make run
#
# 	Build release versions in staging directory
# 	$ make staging
#
# 	(only run this on Peru)
# 	$ make peru-publish
#
########################################

################################################################################
# utils
################################################################################

# Make doesn't come with a recursive wildcard function so we have to use this:
#
rwildcard=$(foreach d,$(wildcard $(1:=/*)),$(call rwildcard,$d,$2) $(filter $(subst *,%,$2),$d))

# check if minify is installed
MINIFY := $(shell command -v minify 2> /dev/null)

# note: usage of mkdir -p $(@D)
# $(@D), means "the directory the current target resides in"
# using it to make sure that a staging directory is created

################################################################################
# filesets
################################################################################

CLIENT_FILES = $(call rwildcard,www,*)
SERVER_FILES = $(call rwildcard,server/src,*) $(wildcard server/errors/*.html) server/Cargo.toml
SYSTEMD_FILES = $(wildcard misc/systemd/*)

WASM_FILES = $(wildcard client-colour/src/*) client-colour/Cargo.toml

.PHONY: run clean-staging

################################################################################
# top-level public targets
################################################################################

run: www/client_colour_bg.wasm server
	cargo run --manifest-path server/Cargo.toml --bin memo_server

server: server/target/debug/memo_server
server-release: server/target/release/memo_server

staging: clean-staging staging/www/index.html staging/memo_server staging/systemd/isg-memo.sh staging/www/client_colour_bg.wasm

# only run this on the server
peru-publish: staging
	mkdir -p ~/work/memo
	rsync -avzh staging/. ~/work/memo

clean-staging:
	rm -rf staging

################################################################################
# targets
################################################################################

server/target/debug/memo_server: $(SERVER_FILES)
	cargo build --manifest-path server/Cargo.toml --bin memo_server

server/target/release/memo_server: $(SERVER_FILES)
	cargo build --manifest-path server/Cargo.toml --bin memo_server --release

www/client_colour_bg.wasm: $(WASM_FILES)
	cargo build --manifest-path client-colour/Cargo.toml --target wasm32-unknown-unknown
	wasm-bindgen client-colour/target/wasm32-unknown-unknown/debug/client_colour.wasm --out-dir www --no-typescript --no-modules

staging/www/client_colour_bg.wasm: $(WASM_FILES)
	mkdir -p $(@D)
	cargo build --manifest-path client-colour/Cargo.toml --release --target wasm32-unknown-unknown
	wasm-bindgen client-colour/target/wasm32-unknown-unknown/release/client_colour.wasm --out-dir staging/www --no-typescript --no-modules

staging/www/index.html: $(CLIENT_FILES)
	mkdir -p $(@D)
	cp -r www staging/.
ifdef MINIFY
	minify -o staging/www/ --match=\.css www
	minify -r -o staging/www/js --match=\.js www/js
endif
	sed -i 's/^var devMode.*/\/\/ START OF CODE MODIFIED BY MAKEFILE\nvar devMode = false;/g' staging/www/service-worker.js
	sed -i "s/^var CACHE_NAME.*/var CACHE_NAME = 'memo-$$(date '+%Y%m%d-%H%M')';\n\/\/ END OF CODE MODIFIED BY MAKEFILE/g" staging/www/service-worker.js

staging/memo_server: server-release
	mkdir -p $(@D)
	cp server/target/release/memo_server staging/.
	cp .env.example staging/.
	cp -r server/errors staging/.

staging/systemd/isg-memo.sh: $(SYSTEMD_FILES)
	mkdir -p $(@D)
	cp -r misc/systemd staging/.
