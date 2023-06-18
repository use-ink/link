import { PinkValues, TransferredBalanceEvent, UIEvent } from "../types";
import { FormikHelpers } from "formik";
import { usePinkContract } from ".";
import { useWallet } from "useink";
import { pinkMeta } from "../const";
import { NFTStorage } from "nft.storage";
import { decodeError } from "useink/core";
import { pickResultOk } from "useink/utils";
import { usePinkPsp34Contract } from "./usePinkPsp34Contract";


export const useMintHandler = () => {
  const { pinkMint, pinkRobotContract } = usePinkContract();
  const { totalSupply } = usePinkPsp34Contract();
  const { account } = useWallet();

  return async (
    values: PinkValues,
    { setSubmitting, setStatus }: FormikHelpers<PinkValues>
  ) => {

    const getTokenId = async (values: PinkValues) => {
      // get tokenId from the contract's total_supply
      const s = await totalSupply?.send([], { defaultCaller: true });
      if (s?.ok && s.value.decoded) {
        values.tokenId[values!.contractType] = Number(s.value.decoded) + 1;
        console.log("Next tokenId premint", values.tokenId[values!.contractType]);

      }
    };

    const uploadImage = async (values: PinkValues) => {
      if (!values!.imageData[values!.contractType]) {
        console.log("ImageData not set values.contractType,", values!.contractType);
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
        attributes: [
          { trait_type: "Prompt", value: values!.prompt },
          { trait_type: "AI Model", value: values!.aiModel.name},
          { trait_type: "Artist", value: values!.artist.name},
          { trait_type: "Style", value: values!.aiStyle.name},
        ],
      })

      // Save the URL
      console.log("Generated IPFS url:", metadata.url);
      values!.ipfs = metadata.url;
    };

    if (!account) return;

    console.log("Minting Image... ");

    // get tokenId from the contract's total_supply
    await getTokenId(values);

    console.log("PinkValues", values);
    // upload image to nft.storage
    await uploadImage(values);

    const mintArgs = [values.contractType, values.ipfs];
    const options = { value: values.price };
    pinkMint?.signAndSend(mintArgs, options, (result, _api, error) => {
      if (error) {
        console.error(JSON.stringify(error));
        setSubmitting(false);
      }
      console.log("Mint Tx", result?.status.toHuman());

      if (!result?.status.isInBlock) return;
      const events: UIEvent[] = [];

      // Collect Contract emitted events
      result?.contractEvents?.forEach(({ event, args }) => {
        events.push({
          name: event.identifier,
          message: `${event.docs.join()}`,
        });
      });

      // Collect pallet emitted events
      result?.events.forEach(({ event }) => {
        if ('ContractEmitted' !== event.method) {
          let message = '';

          if ('balances' === event.section) {
            const data = typeof event.data.toHuman() as any as TransferredBalanceEvent;
            message = `Amount: ${data.amount}`;
          }

          events.push({
            name: `${event.section}:${event.method}`,
            message,
          });
        }
      });

      const dispatchError = pinkMint.result?.dispatchError;

      if (dispatchError && pinkRobotContract?.contract) {
        const errorMessage = decodeError(dispatchError, pinkRobotContract, undefined, 'Something went wrong');
        setStatus({ finalized: true, events, errorMessage })
      }
      setStatus({ finalized: true, events, errorMessage: "" })
      setSubmitting(false);
    });
  };
};

