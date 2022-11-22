import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(identifier: String): AssetHandover.NonFungibleTokenInfo? {
    return AssetHandover.getNonFungibleTokenInfoMapping()[identifier]
}
