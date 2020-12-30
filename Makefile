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
# 	Build client-colour wasm
# 	$ make wasm-colour
#
#   DEPLOYING
#
# 	Upload release builds to server:
# 	$ make upload
#
########################################

.PHONY: run clean-dist

release: clean-dist client-dist server-dist systemd-dist wasm-colour-dist wasm-yew-dist wasm-seed-dist

clean-dist:
	rm -rf dist

upload: release
	rsync -avzhe ssh dist/. indy@indy.io:/home/indy/work/memo

WASM_SEED_FILES = $(call rwildcard,client_seed/src,*) client_seed/Cargo.toml
WASM_YEW_FILES = $(call rwildcard,client_yew/src,*) client_yew/Cargo.toml
WASM_COLOUR_FILES = $(call rwildcard,client-colour/src,*) client-colour/Cargo.toml

CLIENT_FILES = $(call rwildcard,www,*)
SERVER_FILES = $(call rwildcard,server/src,*) $(wildcard server/errors/*.html) server/Cargo.toml
SYSTEMD_FILES = $(wildcard misc/systemd/*)

# run the server
run:
	cargo run --manifest-path server/Cargo.toml

wasm-colour: www/client_colour_bg.wasm
wasm-seed: www/client_seed_bg.wasm
wasm-yew: www/client_yew_bg.wasm

wasm-colour-dist: dist/www/client_colour_bg.wasm
wasm-seed-dist: dist/www/client_seed_bg.wasm
wasm-yew-dist: dist/www/client_yew_bg.wasm

client-dist: dist/www/index.html
server-dist: dist/memo_server
systemd-dist: dist/systemd/isg-memo.sh

www/client_colour_bg.wasm: $(WASM_COLOUR_FILES)
	cargo build --manifest-path client-colour/Cargo.toml --target wasm32-unknown-unknown
	wasm-bindgen client-colour/target/wasm32-unknown-unknown/debug/client_colour.wasm --out-dir www --no-typescript --no-modules

www/client_seed_bg.wasm: $(WASM_SEED_FILES)
	cargo build --manifest-path client_seed/Cargo.toml --target wasm32-unknown-unknown
	wasm-bindgen client_seed/target/wasm32-unknown-unknown/debug/client_seed.wasm --out-dir www --no-typescript --no-modules

www/client_yew_bg.wasm: $(WASM_YEW_FILES)
	cargo build --manifest-path client_yew/Cargo.toml --target wasm32-unknown-unknown
	wasm-bindgen client_yew/target/wasm32-unknown-unknown/debug/client_yew.wasm --out-dir www --no-typescript --no-modules

dist/www/client_colour_bg.wasm: $(WASM_COLOUR_FILES)
	mkdir -p $(@D)
	cargo build --manifest-path client-colour/Cargo.toml --target wasm32-unknown-unknown --release
	wasm-bindgen client-colour/target/wasm32-unknown-unknown/release/client_colour.wasm --out-dir dist/www --no-typescript --no-modules

dist/www/client_seed_bg.wasm: $(WASM_SEED_FILES)
	mkdir -p $(@D)
	cargo build --manifest-path client_seed/Cargo.toml --target wasm32-unknown-unknown --release
	wasm-bindgen client_seed/target/wasm32-unknown-unknown/release/client_seed.wasm --out-dir dist/www --no-typescript --no-modules

dist/www/client_yew_bg.wasm: $(WASM_YEW_FILES)
	mkdir -p $(@D)
	cargo build --manifest-path client_yew/Cargo.toml --target wasm32-unknown-unknown --release
	wasm-bindgen client_yew/target/wasm32-unknown-unknown/release/client_yew.wasm --out-dir dist/www --no-typescript --no-modules

dist/www/index.html: $(CLIENT_FILES)
	mkdir -p $(@D)
	cp -r www dist/.
	rm dist/www/client*.js
	rm dist/www/client*.wasm
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
