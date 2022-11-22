import AssetHandover from "../../contracts/AssetHandover.cdc"
import NonFungibleToken from "../../contracts/interfaces/NonFungibleToken.cdc"
import Domains from 0x4d452103055f8f21

transaction(identifier: String) {
    prepare(account: AuthAccount) {
        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        let receiverRef = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        if !receiverRef.check() {
            let collection <- Domains.createEmptyCollection()
            account.save<@NonFungibleToken.Collection>(<- collection, to: info.storagePath)
            account.link<&Domains.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, Domains.CollectionPublic}>(
                info.publicPath,
                target: info.storagePath
            )
            account.link<&Domains.Collection>(
                info.privatePath,
                target: info.storagePath
            )
        }
    }
}
