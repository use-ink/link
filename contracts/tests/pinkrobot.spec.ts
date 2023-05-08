import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import Pink_factory from "../types/constructors/pinkrobot";
import PinkRobot from "../types/contracts/pinkrobot";
import PinkContract from "../types/contracts/pinkrobot";
import BN from "bn.js";
import Psp_factory from "../types/constructors/pinkpsp34";
import Psp from "../types/contracts/pinkpsp34";
import PspContract from "../types/contracts/pinkpsp34";
import { emit } from "./helper";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

use(chaiAsPromised);

const MAX_SUPPLY = 888;
const TOKEN_URI = "ipfs://tokenUriPrefix/";
const ONE = new BN(10).pow(new BN(18));
const PRICE_PER_MINT = ONE;

// Create a new instance of contract
const wsProvider = new WsProvider("ws://127.0.0.1:9944");
// Create a keyring instance
const keyring = new Keyring({ type: "sr25519" });

describe("Pink Robot minting", () => {
  let pinkFactory: Pink_factory;
  let pspFactory: Psp_factory;
  let api: ApiPromise;
  let deployer: KeyringPair;
  let bob: KeyringPair;
  let dave: KeyringPair;
  let pinkrobot: PinkContract;
  let psp: PspContract;

  beforeEach(async function (): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider, noInitWarn: true });
    deployer = keyring.addFromUri("//Alice");
    bob = keyring.addFromUri("//Bob");
    dave = keyring.addFromUri("//Dave");
    pinkFactory = new Pink_factory(api, deployer);
    pinkrobot = new PinkContract(
      (
        await pinkFactory.new()
      ).address,
      deployer,
      api
    );

    pspFactory = new Psp_factory(api, deployer);
    psp = new PspContract(
      (
        await pspFactory.new(
          ["PinkPsp34"],
          ["PPSP"],
          MAX_SUPPLY,
          null,
        )
      ).address,
      deployer,
      api
    );


  });

  it("Init contracts works", async () => {
    expect(
      (await psp.query.totalSupply()).value.unwrap().toNumber()
    ).to.equal(0);
    expect((await psp.query.maxSupply()).value.unwrap()).to.equal(MAX_SUPPLY);
    expect(
      (await pinkrobot.tx.addNewContract(1, psp.address)).result
    ).to.be.ok;
    expect(
      (await pinkrobot.query.getContract(1)).value.ok
    ).to.equal(psp.address);
  });

  it("PSP change owner works", async () => {
    let OwnerRes1 = (await psp.query.owner()).value.ok;
    expect(OwnerRes1).to.equal(deployer.address);
    expect((await psp.withSigner(deployer).tx.transferOwnership(pinkrobot.address)).result).to.be.ok;;
    let newOwner = (await psp.query.owner()).value.ok;
    expect(newOwner).to.equal(pinkrobot.address);
  });

  it("Mint PSP via pinkrobot works", async () => {
    expect(
      (await pinkrobot.tx.addNewContract(1, psp.address)).result
    ).to.be.ok;

    expect(
      (await pinkrobot.query.getContract(1)).value.ok
    ).to.equal(psp.address);

    // set pinkrobot to be the owner of PSP34 contract
    expect((await psp.withSigner(deployer).tx.transferOwnership(pinkrobot.address)).result?.isFinalized).to.be.true;
    const res = await pinkrobot.withSigner(deployer).tx.pinkMint(1, [TOKEN_URI]);
    console.log("mint result", res.result.toHuman());
    expect((await psp.query.totalSupply()).value.unwrap().toNumber()).to.equal(1);
  });

  it("Should fail if pinkrobot is not the owner", async () => {
    expect(
      (await pinkrobot.tx.addNewContract(1, psp.address)).result
    ).to.be.ok;

    expect(
      (await pinkrobot.query.getContract(1)).value.ok
    ).to.equal(psp.address);

    // set pinkrobot to be the owner of PSP34 contract
    const res = await pinkrobot.withSigner(deployer).tx.pinkMint(1, [TOKEN_URI]);
    console.log("mint result", res.result.toHuman());
    expect((await psp.query.totalSupply()).value.unwrap().toNumber()).to.equal(0);
  });

});


