export const withdrawFungibleToken = `
import AssetHandover from 0xAssetHandover
import FungibleToken from 0xFT
import FungibleTokenSwitchboard from 0xFT

transaction(identifier: String, address: Address, amount: UFix64) {
  let lockUp: &{AssetHandover.LockUpPublic}
  let receiverRef: Capability<&{FungibleToken.Receiver}>
  let feeTokens: @FungibleToken.Vault

  prepare(account: AuthAccount) {
      self.lockUp = getAccount(address)
          .getCapability(AssetHandover.LockUpPublicPath)
          .borrow<&{AssetHandover.LockUpPublic}>()
          ?? panic("Could not borrow AssetHandover.LockUpPublic reference.")

      let info = AssetHandover.getFungibleTokenInfoMapping()[identifier]
          ?? panic("Non-supported token.")

      self.receiverRef = account.getCapability<&FungibleTokenSwitchboard.Switchboard{FungibleToken.Receiver}>(
          FungibleTokenSwitchboard.ReceiverPublicPath
      )

      if !self.receiverRef.check() {
          panic("Could not borrow FungibleTokenSwitchboard.Switchboard reference.")
      }

      let vault = account.borrow<&FungibleToken.Vault>(
          from: /storage/flowTokenVault
      ) ?? panic("Could not borrow FungibleToken.Vault reference.")

      self.feeTokens <- vault.withdraw(
          amount: AssetHandover.getWithdrawFees()
      )
  }

  execute {
      self.lockUp.withdrawFT(
          identifier: identifier,
          amount: amount,
          receiver: self.receiverRef,
          feeTokens: <- self.feeTokens
      )
  }
}
`