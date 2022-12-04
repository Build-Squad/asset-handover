import Domains from "../../contracts/nfts/Domains.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"

pub struct DomainNFT {
    pub let name: String
    pub let description: String
    pub let thumbnail: String
    pub let owner: Address
    pub let type: Type

    init(
        name: String,
        description: String,
        thumbnail: String,
        owner: Address,
        type: Type
    ) {
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
        self.owner = owner
        self.type = type
    }
}

pub fun main(address: Address, nftID: UInt64): DomainNFT? {
    let collectionRef = getAccount(address).getCapability<&Domains.Collection{MetadataViews.ResolverCollection}>(
        Domains.DomainsPublicPath
    ).borrow() ?? panic("Could not borrow Collection reference")

    let nft = collectionRef.borrowViewResolver(id: nftID)

    if let view = nft.resolveView(Type<MetadataViews.Display>()) {
        let display = view as! MetadataViews.Display
        let owner: Address = nft.owner!.address
        let nftType = nft.getType()

        return DomainNFT(
            name: display.name,
            description: display.description,
            thumbnail: display.thumbnail.uri(),
            owner: owner,
            type: nftType
        )
    }

    return nil
}
