import BlpToken from "../../contracts/tokens/BlpToken.cdc"
import FungibleTokenMetadataViews from "../../contracts/utility/FungibleTokenMetadataViews.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"

pub fun main(address: Address): FungibleTokenMetadataViews.FTDisplay? {
    let metadataRef = getAccount(address)
        .getCapability(BlpToken.metadataPath)
        .borrow<&{MetadataViews.Resolver}>()
        ?? panic("Could not borrow a reference to the MetadataViews.Resolver")

    let displayView = FungibleTokenMetadataViews.getFTDisplay(
        metadataRef
    )

    return displayView
}
