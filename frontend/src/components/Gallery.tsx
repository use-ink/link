import { useWallet } from "useink";
import { usePinkPsp34Contract } from "../hooks/usePinkPsp34Contract";
import { useEffect, useState } from "react";
import { pickDecoded, pickResultOk } from "useink/utils";
import { Id } from "../types";
import { Error } from "./Error";
import axios from "axios";
import { marketplaceTokenUrl } from "../const";

type Props = {};

export const Gallery: React.FC<Props> = ({}) => {
  const [tokensUrls, setTokensUrls] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const { totalBalance, tokenUri } = usePinkPsp34Contract();
  const { account } = useWallet();
  const MAX_GALLERY_SIZE = 12;

  const handleCloseError = () => setError("");

  const getTotalBalance = async (): Promise<Id[] | undefined> => {
    const result = await totalBalance?.send([account?.address], {
      defaultCaller: true,
    });
    const ownedTokens = pickDecoded<Id[]>(result);

    return ownedTokens;
  };

  const getProxiedUri = (ipfsUri: string | undefined): string | undefined => {
    const ipfsGateway = "https://ipfs.io/ipfs/";
    return ipfsUri ? ipfsUri.replace("ipfs://", ipfsGateway) : undefined;
  };

  const getMarketplaceUrl = (tokenImageUrl: string): string => {
    const tokenId = tokenImageUrl.split("/").pop()?.split(".")[0] || "";
    return `${marketplaceTokenUrl}::${tokenId}/${tokenId}`
  };

  const getTokensMetadata = async (
    tokens: Id[]
  ): Promise<(string | unknown)[]> => {
    const metadataUrls = await Promise.all(
      tokens.map(async (token) => {
        const result = await tokenUri?.send([token], {
          defaultCaller: true,
        });
        return getProxiedUri(pickResultOk<string, string>(result));
      })
    );

    return await Promise.all(
      metadataUrls.map(async (url) => {
        if (url) {
          const result = await axios.get(url);
          return result.data;
        } else {
          return undefined;
        }
      })
    );
  };

  const list = tokensUrls.map((url) => {
    return (
      <div className="gallery-image-wrapper" key={url}>
        <a href={getMarketplaceUrl(url)} target="_blank">
          <img className="gallery-image" src={url} alt="Token" />
        </a>
      </div>
    );
  });

  const getNftImagesUrls = async (): Promise<void> => {
    try {
      const ownedTokens = await getTotalBalance();
      if (ownedTokens) {
        const metadata = await getTokensMetadata(ownedTokens);

        const nftUrls = metadata.map((data: any) => {
          return getProxiedUri(data.image);
        }).splice(0, MAX_GALLERY_SIZE);

        setTokensUrls(nftUrls as string[]);
      }
    } catch (err: any) {
      setError(`Can't load minted tokens preview: ${err.toString()}`);
    }
  };

  useEffect(() => {
    getNftImagesUrls();
  }, [account?.address]);

  return (
    <div>
      <div className="gallery-container">{list}</div>
      <Error open={!!error} onClose={handleCloseError} message={error} />
    </div>
  );
};
