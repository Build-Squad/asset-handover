import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"
import BlpToken from "../../contracts/tokens/BlpToken.cdc"

transaction(receiver: Address, amount: UFix64) {
    prepare(account: AuthAccount) {
        let blpVault = account.borrow<&BlpToken.Vault>(
            from: BlpToken.vaultPath
        ) ?? panic("Could not borrow BlpToken.Vault reference")

        let receiverRef = getAccount(receiver)
            .getCapability(BlpToken.receiverPath)
            .borrow<&BlpToken.Vault{FungibleToken.Receiver}>()
            ?? panic("Could not borrow FungibleToken.Receiver reference")

        let tokens <- blpVault.withdraw(amount: amount)
        receiverRef.deposit(from: <- tokens)
    }
}
