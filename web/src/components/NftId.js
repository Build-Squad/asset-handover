import { useState, useEffect } from "react";

export default function NftId({ lockUp, item }) {
  const [nftIDsLength, setNftIDsLength] = useState(0);

  useEffect(() => {
    const updateNftIDsLength = () => {
      let length = 0;
      lockUp.nonFungibleTokens.forEach((nft) => {
        if (item.nftType.replace(".NFT", "") === nft.identifier) {
          length = nft.nftIDs.length;
        }
      });
      setNftIDsLength(length);
    };

    updateNftIDsLength();
  }, [lockUp, item]);

  return <h6 className="d-inline text-center">{nftIDsLength}</h6>;
}
