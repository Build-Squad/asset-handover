import AssetHandover from "../../contracts/AssetHandover.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"
import FlowToken from "../../contracts/tokens/FlowToken.cdc"
import BlpToken from "../../contracts/tokens/BlpToken.cdc"
import MonsterMaker from "../../contracts/nfts/MonsterMaker.cdc"
import KittyItems from "../../contracts/nfts/KittyItems.cdc"
import Domains from "../../contracts/nfts/Domains.cdc"

transaction() {
    let admin: &AssetHandover.Admin

    prepare(account: AuthAccount) {
        self.admin = account.getCapability(
            AssetHandover.AdminPrivatePath
        ).borrow<&AssetHandover.Admin>()
        ?? panic("Could not borrow AssetHandover.Admin reference.")
    }

    execute {
        var identifier = Type<FlowToken>().identifier
        var fungibleTokenInfo = AssetHandover.FungibleTokenInfo(
            name: "FLOW",
            receiverPath: /public/flowTokenReceiver,
            balancePath: /public/flowTokenBalance,
            privatePath: /private/flowTokenVault,
            storagePath: /storage/flowTokenVault
        )
        self.admin.addFungibleTokenInfo(identifier: identifier, tokenInfo: fungibleTokenInfo)

        identifier = Type<BlpToken>().identifier
        fungibleTokenInfo = AssetHandover.FungibleTokenInfo(
            name: "BLP",
            receiverPath: /public/blpTokenReceiver,
            balancePath: /public/blpTokenMetadata,
            privatePath: /private/blpTokenVault,
            storagePath: /storage/blpTokenVault
        )
        self.admin.addFungibleTokenInfo(identifier: identifier, tokenInfo: fungibleTokenInfo)

        identifier = Type<KittyItems>().identifier
        var nonFungibleTokenInfo = AssetHandover.NonFungibleTokenInfo(
            name: "KittyItems",
            publicPath: KittyItems.CollectionPublicPath,
            privatePath: /private/KittyItemsCollection,
            storagePath: KittyItems.CollectionStoragePath,
            publicType: Type<&KittyItems.Collection{KittyItems.KittyItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(),
            privateType: Type<&KittyItems.Collection{KittyItems.KittyItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>()
        )
        self.admin.addNonFungibleTokenInfo(identifier: identifier, tokenInfo: nonFungibleTokenInfo)

        identifier = Type<Domains>().identifier
        nonFungibleTokenInfo = AssetHandover.NonFungibleTokenInfo(
            name: "Domains",
            publicPath: /public/flowNameServiceDomains,
            privatePath: /private/flowNameServiceDomains,
            storagePath: /storage/flowNameServiceDomains,
            publicType: Type<&Domains.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, Domains.CollectionPublic, MetadataViews.ResolverCollection}>(),
            privateType: Type<&Domains.Collection>()
        )
        self.admin.addNonFungibleTokenInfo(identifier: identifier, tokenInfo: nonFungibleTokenInfo)

        identifier = Type<MonsterMaker>().identifier
        nonFungibleTokenInfo = AssetHandover.NonFungibleTokenInfo(
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
