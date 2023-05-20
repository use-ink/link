import { web3FromAddress } from "@polkadot/extension-dapp";
import { PinkValues, UIEvent } from "../types";
import { FormikHelpers } from "formik";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ContractSubmittableResult } from "@polkadot/api-contract/base/Contract";
import { useEstimationContext, useLinkContract } from "../contexts";
import { useApi, useExtension } from "useink";
import { pinkMeta } from "../const";
import { NFTStorage, File } from "nft.storage";
import { getDecodedTokenId } from "../helpers";
import type { ContractExecResult } from "@polkadot/types/interfaces";

export const useSubmitHandler = () => {
  const { api } = useApi();
  const { account } = useExtension();
  const { contract } = useLinkContract();
  const { estimation } = useEstimationContext();

  const getTokenId = async (values: PinkValues) => {
    if (!api || !contract) return;

    // get tokenId from the contract's total_supply
    const tokenMessage = contract?.abi.findMessage("getSupply");
    const { result: tokenResult } = await api.call.contractsApi.call<ContractExecResult>(
      account?.address,
      contract?.address,
      0,
      null,
      null,
      tokenMessage?.toU8a([values.contractType]),
    );
    let decodedToken = getDecodedTokenId(tokenResult, tokenMessage?.returnType, contract?.abi.registry);
    console.log("set tokenId to ", decodedToken + 1);
    values.tokenId[values.contractType] = decodedToken + 1;
  };

  const uploadImage = async (values: PinkValues) => {
    if (!values!.imageData[values!.contractType]){
      console.log("ImageData not set values.contractType,",values!.contractType);
      return;
    }
    console.log(
      "uploading Image to nft.storage,", values.contractType, "byteLength=",
      values!.imageData[values!.contractType].byteLength
    );
    const tokenIdString: string = String(values.tokenId[values!.contractType]);
    const name: string = pinkMeta[values!.contractType].name + tokenIdString;
    console.log("storing token name", name);
    const description: string = pinkMeta[values!.contractType].description;
    console.log("storing token description", description);
    const fileName: string = tokenIdString + ".jpeg";
    console.log("storing file name", fileName);
    const imageFile: Uint8Array = values!.imageData[values!.contractType];

    // Create instance to NFT.Storage
    const client = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY! })

    // Send request to store image
    const metadata = await client.store({
      name,
      description,
      image: new File([imageFile], fileName, { type: "image/jpeg" }),
      // properties: {
      //   external_url: "https://pinkrobot.me",
      //   attributes:
      //     [
      //       {
      //         trait_type: "Prompt",
      //         value: "pink robot, " + values!.prompt
      //       },
      //       {
      //         trait_type: "AI Model",
      //         value: values!.aimodel
      //       },
      //     ]
      // }
    })

    // Save the URL
    console.log("Generated IPFS url:", metadata.url);
    values!.ipfs = metadata.url;
  };

  return async (
    values: PinkValues,
    { setSubmitting, setStatus }: FormikHelpers<PinkValues>
  ) => {
    console.log("Submit", api, contract, estimation, account);

    if (!api || !contract || !estimation || !account) return;

    const injector = await web3FromAddress(account.address);
    console.log("Minting Image... ");
    console.log("PinkValues", values);
    console.log("Estimations", estimation);
    console.log(
      "Estimations.storageDeposit",
      estimation.storageDeposit.asCharge.toNumber()
    );
    console.log("Estimations.price", estimation.price);
    console.log("Estimation.gasRequired", estimation.gasRequired);

    // get tokenId from the contract's total_supply
    await getTokenId(values);

    // upload image to nft.storage
    await uploadImage(values);

    try {
      const tx: SubmittableExtrinsic<"promise", ContractSubmittableResult> =
        contract.tx["pinkMint"](
          {
            gasLimit: estimation.gasRequired,
            storageDepositLimit: estimation.storageDeposit.asCharge,
            value: estimation.price,
          },
          values.contractType,
          values.ipfs
        );
      console.log("Sign the message");
      const unsub = await tx.signAndSend(
        account.address,
        { signer: injector.signer },
        (result) => {
          const events: UIEvent[] = [];
          let tokenId = "";
          setSubmitting(true);

          if (result.isInBlock) {
            result.contractEvents?.forEach(({ event, args }) => {
              tokenId = args[0].toHuman()?.toString() || "";
              events.push({
                name: event.identifier,
                message: `${event.docs.join()}`,
              });
            });
            result.events.forEach(({ event }) => {
              let message = "";
              if (event.section === "balances") {
                const data = event.data.toHuman() as {
                  who: string;
                  amount: string;
                };

                message = `Amount: ${data.amount}`;
              }
              event.method !== "ContractEmitted" &&
                events.push({
                  name: `${event.section}:${event.method}`,
                  message,
                });
            });
            if (!result.dispatchError) {
              console.log("Minted tokenId", tokenId);
              setStatus({ finalized: true, events, errorMessage: "", tokenId });
            } else {
              let message = "Unknown Error";
              if (result.dispatchError.isModule) {
                const decoded = api.registry.findMetaError(
                  result.dispatchError.asModule
                );
                message = `${decoded.section.toUpperCase()}.${decoded.method
                  }: ${decoded.docs}`;
              }
              console.log("Minting error", message);

              setStatus({
                finalized: true,
                events,
                errorMessage: message,
              });
            }
            setSubmitting(false);
            unsub && unsub();
          }
        }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
};
