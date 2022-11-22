import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"
import BlpToken from "../../contracts/tokens/BlpToken.cdc"

transaction() {
    prepare(account: AuthAccount) {
        let blpVault <- BlpToken.createEmptyVault()
        account.save<@FungibleToken.Vault>(<-blpVault, to: BlpToken.vaultPath)

        account.link<&BlpToken.Vault{FungibleToken.Balance}>(
            BlpToken.balancePath,
            target: BlpToken.vaultPath
        )
        account.link<&BlpToken.Vault{FungibleToken.Receiver}>(
            BlpToken.receiverPath,
            target: BlpToken.vaultPath
        )
    }
}
