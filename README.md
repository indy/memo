# Memo

A note keeping app

## Server

rename server/.env.example to server/.env and update it for your environment

$ cd server && cargo run

## Deploying

$ make upload

## (Dev) loading a test database

- copy a backup from the server (e.g. memo_20201116.psql)
- create a local database: $ createdb memo_20201116
- load in the backup: psql memo_20201116 < memo_20201116.psql
- update the .env variables

- restart the server, login, may need an additional refresh to display the db name

## (Dev) generating the library js files

preact.js:
package.json script in preact project:
rename all mangle.json files to _mangle.json

"isg": "microbundle -i src/index.js -o dist/isg-bundle.js --no-pkg-main --no-compress -f es",
then rename dist/isg-bundle.module.js to preact.js

hooks.js:
go into the preact project's hooks/src directory, copy index.js to hooks.js updating the import declaration.

htm:
manually copied build.mjs from the project and made changes

preact-router:
manually copied over and made changes


# Requirements
    A modern (for c.2020) web-browser
    PostgreSQL
    Rust
    Make
    (Optional) Minify (https://github.com/tdewolff/minify)

install minify:
$ sudo apt install minify
if the minify binary is not installed on the build system then the unminified assets will be used
