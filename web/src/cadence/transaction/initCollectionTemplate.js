export const initCollectionTemplate = (contractName, contractAddress, publicType, privateType) => `
import AssetHandover from 0xAssetHandover
import NonFungibleToken from 0xNFT
import MetadataViews from 0xMetadataViews
import KittyItems from 0x3efc140bc36649ad

transaction(identifier: String) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        let receiverRef = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        let receiverRefP = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        if !receiverRef.check() && !receiverRefP.check() {
            let collection <- KittyItems.createEmptyCollection()
            account.save<@NonFungibleToken.Collection>(<- collection, to: info.storagePath)
            account.link<&A.3efc140bc36649ad.KittyItems.Collection{A.3efc140bc36649ad.KittyItems.KittyItemsCollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.CollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.Receiver,A.631e88ae7f1d7c20.MetadataViews.ResolverCollection}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&A.3efc140bc36649ad.KittyItems.Collection{A.3efc140bc36649ad.KittyItems.KittyItemsCollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.CollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.Provider,A.631e88ae7f1d7c20.MetadataViews.ResolverCollection}>(
                info.privatePath,
                target: info.storagePath
            )
        } else {
            account.link<&A.3efc140bc36649ad.KittyItems.Collection{A.3efc140bc36649ad.KittyItems.KittyItemsCollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.CollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.Receiver,A.631e88ae7f1d7c20.MetadataViews.ResolverCollection}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&A.3efc140bc36649ad.KittyItems.Collection{A.3efc140bc36649ad.KittyItems.KittyItemsCollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.CollectionPublic,A.631e88ae7f1d7c20.NonFungibleToken.Provider,A.631e88ae7f1d7c20.MetadataViews.ResolverCollection}>(
                info.privatePath,
                target: info.storagePath
            )
        }
    }
}
`
