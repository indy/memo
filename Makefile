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
# 	Copy staging directory onto peru
# 	$ make upload
#
########################################

################################################################################
# utils
################################################################################
# NOTE: have to declare utils at the top of the file, before they're used

# Make doesn't come with a recursive wildcard function so we have to use this:
#
rwildcard=$(foreach d,$(wildcard $(1:=/*)),$(call rwildcard,$d,$2) $(filter $(subst *,%,$2),$d))

# check if minify is installed
MINIFY := $(shell command -v minify 2> /dev/null)

# note: usage of mkdir -p $(@D)
# $(@D), means "the directory the current target resides in"
# using it to make sure that a staging directory is created

################################################################################
# variables
################################################################################

SERVER_BINARY = memo_server

CLIENT_WASM_NAME = wasm_colour
CLIENT_WASM = $(CLIENT_WASM_NAME).wasm
CLIENT_WASM_BG = $(CLIENT_WASM_NAME)_bg.wasm

SERVER_FOLDER = server
CLIENT_FOLDER = client
WASM_FOLDER = client/wasm-colour

################################################################################
# filesets
################################################################################

SERVER_FILES = $(call rwildcard,$(SERVER_FOLDER)/src,*) $(SERVER_FOLDER)/Cargo.toml
SYSTEMD_FILES = $(wildcard misc/systemd/*)

WASM_FILES = $(wildcard $(WASM_FOLDER)/src/*) $(WASM_FOLDER)/Cargo.toml
CLIENT_FILES = $(call rwildcard,$(CLIENT_FOLDER)/src,*)

.PHONY: run clean-staging download-db typescript-watch typescript-typecheck typescript-format deps

deps:
	cd client; yarn install

typescript-watch:
	while true; do inotifywait -e close_write --quiet --recursive ./$(CLIENT_FOLDER)/src; make typescript-build-and-typecheck; done

typescript-build-and-typecheck: $(CLIENT_FOLDER)/www/index.js typescript-typecheck

typescript-typecheck:
	./$(CLIENT_FOLDER)/node_modules/typescript/bin/tsc -p ./$(CLIENT_FOLDER)/tsconfig.json --noEmit

typescript-format:
	cd client; yarn prettier --write src

################################################################################
# top-level public targets
################################################################################

run: $(CLIENT_FOLDER)/www/$(CLIENT_WASM_BG) $(CLIENT_FOLDER)/www/index.js server
	cargo run --manifest-path $(SERVER_FOLDER)/Cargo.toml --bin $(SERVER_BINARY)

server: $(SERVER_FOLDER)/target/debug/$(SERVER_BINARY)
server-release: $(SERVER_FOLDER)/target/release/$(SERVER_BINARY)

staging: clean-staging staging/www/index.html staging/$(SERVER_BINARY) staging/systemd/isg-memo.sh staging/www/$(CLIENT_WASM_BG)

upload: staging
	rsync -avzhe ssh staging/. indy@indy.io:/home/indy/work/memo

clean-staging:
	rm -rf staging

download-db:
	scp indy.io:work/memo/memo.db* .


################################################################################
# targets
################################################################################

$(SERVER_FOLDER)/target/debug/$(SERVER_BINARY): $(SERVER_FILES)
	cargo build --manifest-path $(SERVER_FOLDER)/Cargo.toml --bin $(SERVER_BINARY)

$(SERVER_FOLDER)/target/release/$(SERVER_BINARY): $(SERVER_FILES)
	cargo build --manifest-path $(SERVER_FOLDER)/Cargo.toml --bin $(SERVER_BINARY) --release

$(CLIENT_FOLDER)/www/index.js: $(CLIENT_FILES)
	./$(CLIENT_FOLDER)/node_modules/esbuild/bin/esbuild ./$(CLIENT_FOLDER)/src/index.tsx --sourcemap --bundle --outdir=./$(CLIENT_FOLDER)/www

$(CLIENT_FOLDER)/www/$(CLIENT_WASM_BG): $(WASM_FILES)
	cargo build --manifest-path $(WASM_FOLDER)/Cargo.toml --target wasm32-unknown-unknown
	wasm-bindgen $(WASM_FOLDER)/target/wasm32-unknown-unknown/debug/$(CLIENT_WASM) --out-dir $(CLIENT_FOLDER)/www --no-modules

staging/www/$(CLIENT_WASM_BG): $(WASM_FILES)
	mkdir -p $(@D)
	cargo build --manifest-path $(WASM_FOLDER)/Cargo.toml --release --target wasm32-unknown-unknown
	wasm-bindgen $(WASM_FOLDER)/target/wasm32-unknown-unknown/release/$(CLIENT_WASM) --out-dir staging/www --no-typescript --no-modules

staging/www/index.html: $(CLIENT_FOLDER)/www/index.js
	mkdir -p $(@D)
	cp -r $(CLIENT_FOLDER)/www staging/.
ifdef MINIFY
	minify -o staging/www/ --match=\.css client/www
#	minify -r -o staging/www --match=index\.js client/www
endif
	sed -i 's/^var devMode.*/\/\/ START OF CODE MODIFIED BY MAKEFILE\nvar devMode = false;/g' staging/www/service-worker.js
	sed -i "s/^var CACHE_NAME.*/var CACHE_NAME = 'memo-$$(date '+%Y%m%d-%H%M')';\n\/\/ END OF CODE MODIFIED BY MAKEFILE/g" staging/www/service-worker.js

staging/$(SERVER_BINARY): server-release
	mkdir -p $(@D)
	cp $(SERVER_FOLDER)/target/release/$(SERVER_BINARY) staging/.
	cp .env.example staging/.

staging/systemd/isg-memo.sh: $(SYSTEMD_FILES)
	mkdir -p $(@D)
	cp -r misc/systemd staging/.
