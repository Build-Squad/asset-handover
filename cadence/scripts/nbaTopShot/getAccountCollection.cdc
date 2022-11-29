import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from 0x631e88ae7f1d7c20
import TopShot from 0x877931736ee77cff

pub fun main(address: Address): [UInt64] {
    let collectionRef = getAccount(address)
        .getCapability(/public/MomentCollection)
        .borrow<&AnyResource{NonFungibleToken.CollectionPublic, TopShot.MomentCollectionPublic, MetadataViews.ResolverCollection}>()
        ?? panic("Could not borrow a reference to the stored Moment collection")

    return collectionRef.getIDs()
}
