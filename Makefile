ARCHES := x86 arm
# upstream publishes amd64+arm64; no Dockerfile to compile for either.
include node_modules/@start9labs/start-sdk/s9pk.mk
