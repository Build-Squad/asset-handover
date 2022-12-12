import AssetHandover from "../../contracts/AssetHandover.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"
import TopShot from 0x877931736ee77cff

transaction {
    let admin: &AssetHandover.Admin

    prepare(account: AuthAccount) {
        self.admin = account.getCapability(
            AssetHandover.AdminPrivatePath
        ).borrow<&AssetHandover.Admin>()
        ?? panic("Could not borrow AssetHandover.Admin reference.")
    }

    execute {
        var identifier = Type<TopShot>().identifier
        var nonFungibleTokenInfo = AssetHandover.NonFungibleTokenInfo(
            name: "NBATopShot",
            publicPath: /public/MomentCollection,
            privatePath: /private/MomentCollection,
            storagePath: /storage/MomentCollection,
            publicType: Type<&{NonFungibleToken.CollectionPublic, TopShot.MomentCollectionPublic, MetadataViews.ResolverCollection}>(),
            privateType: Type<&TopShot.Collection>()
        )
        self.admin.addNonFungibleTokenInfo(identifier: identifier, tokenInfo: nonFungibleTokenInfo)
    }
}
