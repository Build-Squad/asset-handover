import AssetHandover from "../../contracts/AssetHandover.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import MetadataViews from 0x631e88ae7f1d7c20
import CONTRACT_NAME from 0xCONTRACT_ADDRESS

transaction(identifier: String) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        let receiverRef = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        if !receiverRef.check() {
            let collection <- CONTRACT_NAME.createEmptyCollection()
            account.save<@NonFungibleToken.Collection>(<- collection, to: info.storagePath)
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
