# Memo

A note keeping app. Developed at git.indy.io for my own use and mirrored on Github in case anyone wants to use it.

## Server

rename .env.example to .env and update it for your environment

one time initialisation with:
```sh
$ make init
```


then build
```sh
$ make run
```


## Release build

```sh
$ make release
```
The dist directory will contain the release build

## Deploying (to indy.io)

```sh
$ make upload
```


# Requirements
- A modern web-browser
- Rust
- Make
- (Optional) Minify (https://github.com/tdewolff/minify)

install minify:
```sh
$ sudo apt install minify
```

if the minify binary is not installed on the build system then the unminified assets will be used
