import AssetHandover from "../../contracts/AssetHandover.cdc"
import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"
import FungibleTokenSwitchboard from "../../contracts/utility/FungibleTokenSwitchboard.cdc"
import BlpToken from 0xea0cac82689753b7

transaction(identifier: String) {
    let vaultCapabilty: Capability<&{FungibleToken.Receiver}>
    let switchboardRef:  &FungibleTokenSwitchboard.Switchboard

    prepare(account: AuthAccount) {
        let info = AssetHandover.getTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        self.vaultCapabilty = account.getCapability<&{FungibleToken.Receiver}>(
            info.receiverPath
        )

        if !self.vaultCapabilty.check() {
            let vault <- BlpToken.createEmptyVault()
            account.save<@FungibleToken.Vault>(<- vault, to: info.storagePath)
            account.link<&BlpToken.Vault{FungibleToken.Receiver}>(
                info.receiverPath,
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
