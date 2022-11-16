import Domains from "../../contracts/nfts/Domains.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"

pub fun main(address: Address): [Domains.DomainInfo] {
    let collectionRef = getAccount(address).getCapability<&Domains.Collection{NonFungibleToken.CollectionPublic, Domains.CollectionPublic}>(
        Domains.DomainsPublicPath
    ).borrow() ?? panic("Could not borrow Collection reference")
    let domainIDs = collectionRef.getIDs()
    let domainInfos:[Domains.DomainInfo] = []

    for domainID in domainIDs {
        let domain = collectionRef.borrowDomain(id: domainID)
        domainInfos.append(domain.getInfo())
    }

    return domainInfos
}
