
import { useState, useEffect } from "react";

export default function AddNftId({ lockUp, item }) {
  const [nftIDsLength, setNftIDsLength] = useState(0);

  useEffect(() => {
    const updateNftIDsLength = () => {
      let length = 0;

      if (lockUp.nonFungibleTokens.length === 0) {
        length = item.nftsCount;
      } else {
        lockUp.nonFungibleTokens.forEach((nft) => {
          if (item.nftType.replace(".NFT", "") === nft.identifier) {
            length = item.nftsCount - nft.nftIDs.length;
          }
        });
      }


      setNftIDsLength(length);
    };

    updateNftIDsLength();
  }, [lockUp, item]);

  return (
    <h5 className='text-center'>
      ({nftIDsLength})
    </h5>
  )
}