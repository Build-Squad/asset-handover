import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(): {String: AssetHandover.FungibleTokenInfo} {
    return AssetHandover.getFungibleTokenInfoMapping()
}
