import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"
import BlpToken from "../../contracts/tokens/BlpToken.cdc"
import MetadataViews from "../../contracts/utility/MetadataViews.cdc"

transaction() {
    prepare(account: AuthAccount) {
        let blpVault <- BlpToken.createEmptyVault()
        account.save<@FungibleToken.Vault>(<-blpVault, to: BlpToken.storagePath)

        account.link<&BlpToken.Vault{FungibleToken.Receiver}>(
            BlpToken.receiverPath,
            target: BlpToken.storagePath
        )

        account.link<&BlpToken.Vault{FungibleToken.Balance, MetadataViews.Resolver}>(
            BlpToken.metadataPath,
            target: BlpToken.storagePath
        )
    }
}
