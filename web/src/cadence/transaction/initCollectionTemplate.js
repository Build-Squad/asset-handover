export const initCollectionTemplate = (contractName, contractAddress, publicType, privateType) => `
import AssetHandover from 0xAssetHandover
import NonFungibleToken from 0xNFT
import MetadataViews from 0xMetadataViews
import ${contractName} from ${contractAddress}

transaction(identifier: String) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        let receiverRef = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        let receiverRefP = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.privatePath
        )

        let collectionExist = account.type(at: info.storagePath)

        if !receiverRef.check() && collectionExist == nil {
            let collection <- ${contractName}.createEmptyCollection()
            account.save<@NonFungibleToken.Collection>(<- collection, to: info.storagePath)
            account.link<&KittyItems.Collection{KittyItems.KittyItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&KittyItems.Collection{KittyItems.KittyItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(
                info.privatePath,
                target: info.storagePath
            )
        } else {
            account.unlink(info.publicPath)
            account.unlink(info.privatePath)
            account.link<&KittyItems.Collection{KittyItems.KittyItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&KittyItems.Collection{KittyItems.KittyItemsCollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}>(
                info.privatePath,
                target: info.storagePath
            )
        }
    }
}
`
