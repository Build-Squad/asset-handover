export const initCollectionTemplate = (contractName, contractAddress, publicType, privateType) => `
import AssetHandover from 0xAssetHandover
import NonFungibleToken from 0xNFT
import MetadataViews from 0xMetadataViews
import ${contractName} from ${contractAddress}

transaction(identifier: String,  nftIDs: [UInt64]) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]!
        let lockUp = account
            .getCapability(AssetHandover.LockUpPrivatePath)
            .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>()
            ?? panic("Could not borrow AssetHandover.LockUpPrivate reference.")

        let receiverRef = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        let collectionExist = account.type(at: info.storagePath)

        if !receiverRef.check() && collectionExist == nil {
            let collection <- ${contractName}.createEmptyCollection()
            account.save<@NonFungibleToken.Collection>(<- collection, to: info.storagePath)
            account.link<&${publicType}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&${privateType}>(
                info.privatePath,
                target: info.storagePath
            )
        } else {
            account.unlink(info.publicPath)
            account.unlink(info.privatePath)
            account.link<&${publicType}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&${privateType}>(
                info.privatePath,
                target: info.storagePath
            )
        }

        account.link<&{NonFungibleToken.Receiver}>(info.privatePath, target: info.storagePath)
        let collection = account.getCapability<&NonFungibleToken.Collection>(
            info.privatePath
        )

        lockUp.lockNFT(
            identifier: identifier,
            collection: collection,
            nftIDs: nftIDs
        )
    }
}
`
