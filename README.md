# link!

## What is this?

This is an unstoppable URL shortener. We built it to illustrate how a
full-stack DApp can be built with:

* Parity's [ink!](https://github.com/paritytech/ink) for the smart contract,
  allowing users to store short URLs as well as resolve them.
* Substrate's [`pallet-contracts`](https://github.com/paritytech/substrate/tree/master/frame/contracts)
  as the smart contracts module used in the blockchain.
* A frontend that enables interactions with the smart contract.
  For our MVP this is done with hardcoded RPC and node URLs.
	In our next iteration we want to migrate the frontend to use 
	[`substrate-connect`](https://github.com/paritytech/substrate-connect)
	and be truly trustless.

## Why?

Popular URL shorteners are for-profit companies, relying on them to
infinitely store a URL can only be done by trusting them to always
adhere to this.

In the past there have been a number of incidents where URL shorteneres
removed the short URL again due to a variety of reasons: commercial
interests, moral values, legal obligations, etc..

We're not aware of incidents where URL shortener services maliciously
decided to change the resolved URL after the fact, but it's something
that can in principle be done -- you don't have any guarantee that 
the short URL will always be resolved to the same long URL.

Blockchains allow us to build decentralized applications in a trustless
manner. With this project we illustrate how our stack can be used
to build a decentralized URL shortener where you don't have to put
trust in a singular entity.
