#!/bin/bash

# set -eux

cargo contract build --manifest-path pinkrobot/Cargo.toml --release
cargo contract build --manifest-path pinkpsp34/Cargo.toml --release
