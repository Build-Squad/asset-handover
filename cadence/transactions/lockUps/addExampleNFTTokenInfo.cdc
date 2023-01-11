import AssetHandover from "../../contracts/AssetHandover.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"
import ExampleNFT from "../../contracts/nfts/ExampleNFT.cdc"

transaction {
    let admin: &AssetHandover.Admin

    prepare(account: AuthAccount) {
        self.admin = account.getCapability(
            AssetHandover.AdminPrivatePath
        ).borrow<&AssetHandover.Admin>()
        ?? panic("Could not borrow AssetHandover.Admin reference.")
    }

    execute {
        var identifier = Type<ExampleNFT>().identifier
        var nonFungibleTokenInfo = AssetHandover.NonFungibleTokenInfo(
            name: "ExampleNFT",
            publicPath: ExampleNFT.CollectionPublicPath,
            privatePath: /private/exampleNFTCollection,
            storagePath: ExampleNFT.CollectionStoragePath,
            publicType: Type<&ExampleNFT.Collection{ExampleNFT.ExampleNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
            privateType: Type<&ExampleNFT.Collection>()
        )
        self.admin.addNonFungibleTokenInfo(identifier: identifier, tokenInfo: nonFungibleTokenInfo)
    }
}
