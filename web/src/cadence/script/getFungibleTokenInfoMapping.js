export const getFungibleTokenInfoMapping = `
import AssetHandover from 0xAssetHandover

pub fun main(): {String: AssetHandover.FungibleTokenInfo} {
  return AssetHandover.getFungibleTokenInfoMapping()
}
`