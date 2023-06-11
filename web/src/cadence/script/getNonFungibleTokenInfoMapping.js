export const getNonFungibleTokenInfoMapping = `
import AssetHandover from 0xAssetHandover

pub fun main(): {String: AssetHandover.NonFungibleTokenInfo} {
  return AssetHandover.getNonFungibleTokenInfoMapping()
}
`