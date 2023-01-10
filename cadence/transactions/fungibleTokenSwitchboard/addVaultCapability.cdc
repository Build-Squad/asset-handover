import AssetHandover from "../../contracts/AssetHandover.cdc"
import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"
import FungibleTokenSwitchboard from "../../contracts/utility/FungibleTokenSwitchboard.cdc"
import FUSD from 0xf8d6e0586b0a20c7

transaction(identifier: String) {
    let vaultCapabilty: Capability<&{FungibleToken.Receiver}>
    let switchboardRef:  &FungibleTokenSwitchboard.Switchboard

    prepare(account: AuthAccount) {
        let info = AssetHandover.getFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        self.vaultCapabilty = account.getCapability<&{FungibleToken.Receiver}>(
            info.receiverPath
        )

        if !self.vaultCapabilty.check() {
            let vault <- FUSD.createEmptyVault() as! @FungibleToken.Vault
            account.save<@FungibleToken.Vault>(<- vault, to: info.storagePath)
            account.link<&FUSD.Vault{FungibleToken.Receiver}>(
                info.receiverPath,
                target: info.storagePath
            )
            account.link<&FUSD.Vault{FungibleToken.Balance}>(
                info.balancePath,
                target: info.storagePath
            )
        }

        self.switchboardRef = account.borrow<&FungibleTokenSwitchboard.Switchboard>(
            from: FungibleTokenSwitchboard.StoragePath
        ) ?? panic("Could not borrow FungibleTokenSwitchboard reference.")
    }

    execute {
        self.switchboardRef.addNewVault(capability: self.vaultCapabilty)
    }
}
