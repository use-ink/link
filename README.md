<img src="./.images/header.png" />

# link! ‒ The Unstoppable URL Shortener<br/>[![matrix][k1]] [![discord][l1]][l2] [![built-with-ink][i1]]

<br clear="both"/>

[k1]: https://img.shields.io/badge/matrix-chat-brightgreen.svg?style=flat
[l1]: https://img.shields.io/discord/722223075629727774?style=flat-square&label=discord
[l2]: https://discord.com/invite/wGUDt2p
[i1]: /.images/badge_flat.svg

This is an unstoppable URL shortener. It allows users to store a short version
of a URL, this short (often mnemonic) version can be resolved back to the long
version.

The section [Why?](#-why) below contains more details on the distinction to
traditional URL shorteners.

We built this project to illustrate how a full-stack DApp can be built with:

* __Smart Contract:__  [ink!](https://github.com/use-ink/ink) as the programming
  language for the contract.
* __Blockchain:__ We use the [Substrate blockchain framework](https://github.com/paritytech/substrate)
  with it's module for smart contracts ([`pallet-contracts`](https://github.com/paritytech/substrate/tree/master/frame/contracts)).
  You can use Substrate to build either standalone blockchains or parachains for Polkadot and Kusama.
* __Frontend:__ For our MVP we use the `polkadot-js` API with hardcoded RPC and node URLs.

In our next iteration of this MVP we want to migrate the frontend to utilize
[`substrate-connect`](https://github.com/paritytech/substrate-connect) under the hood.
In consequence the frontend would be truly trustless, there would then be no need to
put trust in a server that e.g. the RPC return values are indeed what is stored on
the blockchain.

## Rococo Deployment

The link! contract is deployed to Rococo at the following address:
```
5GdHQQkRHvEEE4sDkcLkxCCumSkw2SFBJSLKzbMTNARLTXz3
```
Its metadata can be [found here](./frontend/src/metadata.json). It is upgradeable by the
chain's sudo account.

## 🤔 Why?

Popular URL shorteners are for-profit companies, relying on them to
infinitely store a URL can only be done by trusting those third parties
to always adhere to their pinky promise.

In the past there have been a number of incidents where URL shorteners
removed the short URL at some point for a variety of reasons: commercial
interests, moral values, legal obligations, ….

We're not aware of incidents where URL shortener services maliciously
decided to change the resolved URL after the fact, but it's something
that can in principle be done.
Importantly this could also be done without the companies intention.
An attacker could modify the company database and there would be no way
for a user to know that the short URL now resolves to something else.

_Point being: you don't have any guarantee that the short URL will always
be resolved to the same long URL. You have to trust the central service._

Blockchains allow us to build decentralized applications in a trustless
manner. A central ledger ensures that you can't simply edit a value,
the nodes in a blockchain network (often many thousands) have to come to
consensus on this change. You don't have to trust a central entity anymore
that it will always adhere to its promises. Instead you can put your trust
in the underlying scientific mechanisms behind the blockchain network.

With this project we illustrate how our stack can be used
to build a decentralized URL shortener where you don't have to put
trust in a singular entity.


### Deploy

In `contracts` folder
```sh
pnpm run script deploy
```