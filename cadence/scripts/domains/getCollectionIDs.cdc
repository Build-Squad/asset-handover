import Domains from "../../contracts/nfts/Domains.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"

pub fun main(address: Address): [UInt64] {
    let collectionRef = getAccount(address).getCapability<&Domains.Collection{NonFungibleToken.CollectionPublic}>(
        Domains.DomainsPublicPath
    ).borrow() ?? panic("Could not borrow Collection reference")

    return collectionRef.getIDs()
}
