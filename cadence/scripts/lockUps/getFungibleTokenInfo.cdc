import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(identifier: String): AssetHandover.FungibleTokenInfo? {
    return AssetHandover.getFungibleTokenInfoMapping()[identifier]
}
