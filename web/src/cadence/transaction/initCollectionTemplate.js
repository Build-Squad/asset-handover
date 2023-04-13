export const initCollectionTemplate = (contractName, contractAddress) => `
import AssetHandover from 0xAssetHandover
import NonFungibleToken from 0xNonFungibleToken
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
            info.publicPath
        )

        if !receiverRef.check() && !receiverRefP.check() {
            let collection <- ${contractName}.createEmptyCollection()
            account.save<@NonFungibleToken.Collection>(<- collection, to: info.storagePath)
            account.link<PUBLIC_TYPE>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<PRIVATE_TYPE>(
                info.privatePath,
                target: info.storagePath
            )
        } else {
            account.link<PUBLIC_TYPE>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<PRIVATE_TYPE>(
                info.privatePath,
                target: info.storagePath
            )
        }
    }
}
`
