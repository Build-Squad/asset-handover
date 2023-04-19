export const addVaultCapability = `
import AssetHandover from 0xAssetHandover
import FungibleToken from 0xFT
import FungibleTokenSwitchboard from 0xFT
import BlpToken from 0xAssetHandover

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
          let vault <- BlpToken.createEmptyVault()
          account.save<@FungibleToken.Vault>(<- vault, to: info.storagePath)
          account.link<&BlpToken.Vault{FungibleToken.Receiver}>(
              info.receiverPath,
              target: info.storagePath
          )
          account.link<&BlpToken.Vault{FungibleToken.Balance}>(
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
`