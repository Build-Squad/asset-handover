export const setupAndAddVault = (contractName, contractAddress) => `
import FungibleTokenSwitchboard from 0xFT
import FungibleToken from 0xFT
import AssetHandover from 0xAssetHandover
import ${contractName} from ${contractAddress}

transaction(identifier: String) {
      let vaultCapabilty: Capability<&{FungibleToken.Receiver}>
      var switchboardRef:  &FungibleTokenSwitchboard.Switchboard?

    prepare(account: AuthAccount) {
        let info = AssetHandover.getFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        self.switchboardRef = account.borrow<&FungibleTokenSwitchboard.Switchboard>(
            from: FungibleTokenSwitchboard.StoragePath
        )

        if self.switchboardRef == nil {
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
    }

    execute {
        self.switchboardRef!.addNewVault(capability: self.vaultCapabilty)
    }
}
`