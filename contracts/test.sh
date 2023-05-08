#!/bin/bash
# to run script, 
#     1. Start `swanky-node` of other node with pallet-contracts enabled
#     2. Build contracts with `./build.sh` then 
#     3. Run this script `./test.sh`

# set -eux

# Upload and Instantiate the pinkrobot contract
PINKROBOT_ADDRESS=$(cargo contract instantiate \
    --constructor new \
    --suri //Alice --salt $(date +%s) \
    --manifest-path pinkrobot/Cargo.toml \
    --output-json --skip-confirm --execute | jq .contract -r)

echo "✅ Contract pinkrobot instantiated at: $PINKROBOT_ADDRESS"


PINK_PSP_ADDRESS=$(cargo contract instantiate --constructor new \
    --args 0x74657374 0x7465 1000 "None" \
    --suri //Alice --salt $(date +%s) \
    --manifest-path pinkpsp34/Cargo.toml \
    --output-json --skip-confirm --execute | jq .contract -r)

echo "✅ Contract pinkPsp34 instantiated at: $PINK_PSP_ADDRESS"

# Add contract entry
ADD_RESULT=$(cargo contract call \
    --suri //Alice \
    --contract $PINKROBOT_ADDRESS \
    --message add_new_contract \
    --skip-dry-run \
    --gas 5000000000 --proof-size 150000 \
    --args 1 $PINK_PSP_ADDRESS \
    --manifest-path pinkrobot/Cargo.toml \
    -x --skip-confirm
    )
echo "✅ Executed pinkrobot::add_new_contract"

# Get contract entry
GET_RESULT=$(cargo contract call \
    --suri //Alice \
    --contract $PINKROBOT_ADDRESS \
    --message get_contract \
    --args 1 \
    --manifest-path pinkrobot/Cargo.toml \
    -x --skip-confirm
    )
echo "✅ Executed pinkrobot::get_contract"

# Mint
MINT_RESULT=$(cargo contract call \
    --suri //Bob \
    --contract $PINKROBOT_ADDRESS \
    --message pink_mint \
    --skip-dry-run \
    --gas 9000000000 --proof-size 160000 \
    --args 1 0x69706673 \
    --manifest-path pinkrobot/Cargo.toml \
    -x --skip-confirm
    )
echo "✅ Executed pinkrobot::pink_mint"
