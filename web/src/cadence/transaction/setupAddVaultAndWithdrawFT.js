export const setupAddVaultAndWithdrawFT = (contractName, contractAddress) => `
import FungibleTokenSwitchboard from 0xFT
import FungibleToken from 0xFT
import AssetHandover from 0xAssetHandover
import ${contractName} from 0x${contractAddress}

transaction(identifier: String, address: Address, amount: UFix64) {
    let lockUp: &{AssetHandover.LockUpPublic}
    let vaultCapabilty: Capability<&{FungibleToken.Receiver}>
    var switchboardRef:  &FungibleTokenSwitchboard.Switchboard?
    let feeTokens: @FungibleToken.Vault
    let receiverRef: Capability<&{FungibleToken.Receiver}>
    var wasSetup: Bool

    prepare(account: AuthAccount) {
        self.lockUp = getAccount(address)
            .getCapability(AssetHandover.LockUpPublicPath)
            .borrow<&{AssetHandover.LockUpPublic}>()
            ?? panic("Could not borrow AssetHandover.LockUpPublic reference.")

        let info = AssetHandover.getFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        self.switchboardRef = account.borrow<&FungibleTokenSwitchboard.Switchboard>(
            from: FungibleTokenSwitchboard.StoragePath
        )

        self.receiverRef = account.getCapability<&FungibleTokenSwitchboard.Switchboard{FungibleToken.Receiver}>(
            FungibleTokenSwitchboard.ReceiverPublicPath
        )

        self.wasSetup = true
        if self.switchboardRef == nil {
            self.wasSetup = false
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
            self.switchboardRef = account.borrow<&FungibleTokenSwitchboard.Switchboard>(
                from: FungibleTokenSwitchboard.StoragePath
            )
        }

        if !self.receiverRef.check() {
            account.unlink(FungibleTokenSwitchboard.ReceiverPublicPath)
            account.link<&FungibleTokenSwitchboard.Switchboard{FungibleToken.Receiver}>(
                FungibleTokenSwitchboard.ReceiverPublicPath,
                target: FungibleTokenSwitchboard.StoragePath
            )
        }

        self.vaultCapabilty = account.getCapability<&{FungibleToken.Receiver}>(
            info.receiverPath
        )

        if !self.vaultCapabilty.check() {
            let vault <- ${contractName}.createEmptyVault() as! @FungibleToken.Vault
            account.save<@FungibleToken.Vault>(<- vault, to: info.storagePath)
            account.link<&${contractName}.Vault{FungibleToken.Receiver}>(
                info.receiverPath,
                target: info.storagePath
            )
            account.link<&${contractName}.Vault{FungibleToken.Balance}>(
                info.balancePath,
                target: info.storagePath
            )
        }

        let vault = account.borrow<&FungibleToken.Vault>(
        from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FungibleToken.Vault reference.")
        self.feeTokens <- vault.withdraw(
            amount: AssetHandover.getWithdrawFees()
        )
    }

    execute {
        if (!self.wasSetup) {
            self.switchboardRef!.addNewVault(capability: self.vaultCapabilty)
        }

        self.lockUp.withdrawFT(
            identifier: identifier,
            amount: amount,
            receiver: self.receiverRef,
            feeTokens: <- self.feeTokens
        )
    }
}
`