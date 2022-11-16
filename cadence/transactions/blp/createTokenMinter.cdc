import BlpToken from "../../contracts/tokens/BlpToken.cdc"

transaction(allowedAmount: UFix64) {
    prepare(account: AuthAccount) {
        let admin = account.borrow<&BlpToken.Administrator>(
            from: BlpToken.adminPath
        ) ?? panic("Could not borrow BlpToken.Administrator reference")

        let minter <- admin.createNewMinter(allowedAmount: allowedAmount)
        account.save<@BlpToken.Minter>(<- minter, to: BlpToken.minterPath)
    }
}
