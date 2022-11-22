import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(): {String: AssetHandover.NonFungibleTokenInfo} {
    return AssetHandover.getNonFungibleTokenInfoMapping()
}
