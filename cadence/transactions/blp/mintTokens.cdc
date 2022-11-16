import BlpToken from "../../contracts/tokens/BlpToken.cdc"

transaction(amount: UFix64) {
    prepare(account: AuthAccount) {
        let minter = account.borrow<&BlpToken.Minter>(
            from: BlpToken.minterPath
        ) ?? panic("Could not borrow BlpToken.Minter reference")

        let vault = account.borrow<&BlpToken.Vault>(
            from: BlpToken.vaultPath
        ) ?? panic("Could not borrow BlpToken.Vault reference")

        let blpTokens <- minter.mintTokens(amount: amount)
        vault.deposit(from: <- blpTokens)
    }
}
