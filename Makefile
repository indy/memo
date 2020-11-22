# Make doesn't come with a recursive wildcard function so we have to use this:
#
rwildcard=$(foreach d,$(wildcard $(1:=/*)),$(call rwildcard,$d,$2) $(filter $(subst *,%,$2),$d))

# check if minify is installed
MINIFY := $(shell command -v minify 2> /dev/null)

########################################
#
#   BUILDING
#
# 	Build release builds of everything
# 	$ make release
#
#   DEPLOYING
#
# 	Upload release builds to server:
# 	$ make upload
#
########################################

release: client-dist server-dist systemd-dist

upload: release
	rsync -avzhe ssh dist/. indy@indy.io:/home/indy/work/memo

CLIENT_FILES = $(call rwildcard,www,*)
SERVER_FILES = $(call rwildcard,server/src,*) $(wildcard server/errors/*.html) server/Cargo.toml
SYSTEMD_FILES = $(wildcard misc/systemd/*)

client-dist: dist/www/index.html
server-dist: dist/memo_server
systemd-dist: dist/systemd/isg-memo.sh

dist/www/index.html: $(CLIENT_FILES)
	cp -r www dist/.
ifdef MINIFY
	minify -o dist/www/ --match=\.css www
	minify -r -o dist/www/js --match=\.js www/js
endif

dist/memo_server: $(SERVER_FILES)
	cd server && cargo build --release
	cp server/target/release/memo_server dist/.
	cp server/.env.example dist/.
	cp -r server/errors dist/.

dist/systemd/isg-memo.sh: $(SYSTEMD_FILES)
	cp -r misc/systemd dist/.
