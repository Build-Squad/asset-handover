export const setupAndAddVault = `
import FungibleTokenSwitchboard from 0xFT
import FungibleToken from 0xFT
import AssetHandover from 0xAssetHandover
import CONTRACT_NAME from 0xCONTRACT_ADDRESS

transaction(identifier: String) {
        let vaultCapabilty: Capability<&{FungibleToken.Receiver}>
        var switchboard = account.borrow<&FungibleTokenSwitchboard.Switchboard>(
            from: FungibleTokenSwitchboard.StoragePath
        )
    prepare(account: AuthAccount) {
        let info = AssetHandover.getFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        if switchboard == nil {
            account.save(
                <- FungibleTokenSwitchboard.createSwitchboard(),
                to: FungibleTokenSwitchboard.StoragePath
            )

            account.link<&FungibleTokenSwitchboard.Switchboard{FungibleToken.Receiver}>(
                FungibleTokenSwitchboard.ReceiverPublicPath,
                target: FungibleTokenSwitchboard.StoragePath
            )
            account.link<&FungibleTokenSwitchboard.Switchboard{FungibleTokenSwitchboard.SwitchboardPublic}>(
                FungibleTokenSwitchboard.PublicPath,
                target: FungibleTokenSwitchboard.StoragePath
            )
            switchboard = account.borrow<&FungibleTokenSwitchboard.Switchboard>(
                from: FungibleTokenSwitchboard.StoragePath
            )
        }

        self.vaultCapabilty = account.getCapability<&{FungibleToken.Receiver}>(
            info.receiverPath
        )

        if !self.vaultCapabilty.check() {
            let vault <- CONTRACT_NAME.createEmptyVault() as! @FungibleToken.Vault
            account.save<@FungibleToken.Vault>(<- vault, to: info.storagePath)
            account.link<&CONTRACT_NAME.Vault{FungibleToken.Receiver}>(
                info.receiverPath,
                target: info.storagePath
            )
            account.link<&CONTRACT_NAME.Vault{FungibleToken.Balance}>(
                info.balancePath,
                target: info.storagePath
            )
        }
    }

    execute {
        self.switchboardRef.addNewVault(capability: self.vaultCapabilty)
    }
}
`