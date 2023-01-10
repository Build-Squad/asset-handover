import AssetHandover from "../../contracts/AssetHandover.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"
import ExampleNFT from 0xf8d6e0586b0a20c7

transaction(identifier: String) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        let receiverRef = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        if !receiverRef.check() {
            let collection <- ExampleNFT.createEmptyCollection()
            account.save<@NonFungibleToken.Collection>(<- collection, to: info.storagePath)
            account.link<&ExampleNFT.Collection{ExampleNFT.ExampleNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&ExampleNFT.Collection{ExampleNFT.ExampleNFTCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(
                info.privatePath,
                target: info.storagePath
            )
        }
    }
}
