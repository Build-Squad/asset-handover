import AssetHandover from "../../contracts/AssetHandover.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"
import MonsterMaker from "../../contracts/nfts/MonsterMaker.cdc"

transaction {
    let admin: &AssetHandover.Admin

    prepare(account: AuthAccount) {
        self.admin = account.getCapability(
            AssetHandover.AdminPrivatePath
        ).borrow<&AssetHandover.Admin>()
        ?? panic("Could not borrow AssetHandover.Admin reference.")
    }

    execute {
        var identifier = Type<MonsterMaker>().identifier
        var nonFungibleTokenInfo = AssetHandover.NonFungibleTokenInfo(
            name: "MonsterMaker",
            publicPath: MonsterMaker.CollectionPublicPath,
            privatePath: /private/MonsterMakerCollection,
            storagePath: MonsterMaker.CollectionStoragePath,
            publicType: Type<&MonsterMaker.Collection{MonsterMaker.MonsterMakerCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
            privateType: Type<&MonsterMaker.Collection{MonsterMaker.MonsterMakerCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>()
        )
        self.admin.addNonFungibleTokenInfo(identifier: identifier, tokenInfo: nonFungibleTokenInfo)
    }
}
