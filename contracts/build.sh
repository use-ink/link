#!/bin/bash

# set -eux

cargo contract build --manifest-path pinkrobot/Cargo.toml
cargo contract build --manifest-path pinkpsp34/Cargo.toml 
