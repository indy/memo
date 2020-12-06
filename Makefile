# Make doesn't come with a recursive wildcard function so we have to use this:
#
rwildcard=$(foreach d,$(wildcard $(1:=/*)),$(call rwildcard,$d,$2) $(filter $(subst *,%,$2),$d))

# check if minify is installed
MINIFY := $(shell command -v minify 2> /dev/null)

# note: usage of mkdir -p $(@D)
# $(@D), means "the directory the current target resides in"
# using it to make sure that a dist directory is created

########################################
#
#   BUILDING
#
# 	Build debug server and run
# 	$ make run
#
# 	Build client wasm
# 	$ make wasm
#
#   DEPLOYING
#
# 	Upload release builds to server:
# 	$ make upload
#
########################################

.PHONY: run clean-dist

clean-dist:
	rm -rf dist

release: clean-dist client-dist server-dist systemd-dist wasm-dist

upload: release
	rsync -avzhe ssh dist/. indy@indy.io:/home/indy/work/memo

WASM_FILES = $(call rwildcard,client/src,*) client/Cargo.toml
CLIENT_FILES = $(call rwildcard,www,*)
SERVER_FILES = $(call rwildcard,server/src,*) $(wildcard server/errors/*.html) server/Cargo.toml
SYSTEMD_FILES = $(wildcard misc/systemd/*)

# run the server
run:
	cargo run --manifest-path server/Cargo.toml

# build debug version of client
wasm: www/client.wasm

www/client.wasm: $(WASM_FILES)
	cargo build --manifest-path client/Cargo.toml --target wasm32-unknown-unknown
	wasm-bindgen client/target/wasm32-unknown-unknown/debug/client.wasm --out-dir www --no-typescript --no-modules

wasm-dist: dist/www/client.wasm
client-dist: dist/www/index.html
server-dist: dist/memo_server
systemd-dist: dist/systemd/isg-memo.sh

dist/www/client.wasm: $(WASM_FILES)
	mkdir -p $(@D)
	cargo build --manifest-path client/Cargo.toml --target wasm32-unknown-unknown --release
	cp client/target/wasm32-unknown-unknown/debug/client.wasm dist/www/.

dist/www/index.html: $(CLIENT_FILES)
	mkdir -p $(@D)
	cp -r www dist/.
	rm dist/www/client.wasm
ifdef MINIFY
	minify -o dist/www/ --match=\.css www
	minify -r -o dist/www/js --match=\.js www/js
endif
	sed -i 's/^var devMode.*/\/\/ START OF CODE MODIFIED BY MAKEFILE\nvar devMode = false;/g' dist/www/service-worker.js
	sed -i "s/^var CACHE_NAME.*/var CACHE_NAME = 'memo-$$(date '+%Y%m%d-%H%M')';\n\/\/ END OF CODE MODIFIED BY MAKEFILE/g" dist/www/service-worker.js

dist/memo_server: $(SERVER_FILES)
	mkdir -p $(@D)
	cd server && cargo build --release
	cp server/target/release/memo_server dist/.
	cp .env.example dist/.
	cp -r server/errors dist/.

dist/systemd/isg-memo.sh: $(SYSTEMD_FILES)
	mkdir -p $(@D)
	cp -r misc/systemd dist/.
