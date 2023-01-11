import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import ExampleNFT from "../../contracts/nfts/ExampleNFT.cdc"

pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account
        .getCapability(ExampleNFT.CollectionPublicPath)
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection at specified path")

    return collectionRef.getIDs()
}
