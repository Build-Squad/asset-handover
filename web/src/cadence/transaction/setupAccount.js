export const setupAccount = `
import FungibleTokenSwitchboard from 0xFT
import FungibleToken from 0xFT

transaction {
  prepare(account: AuthAccount) {
      let switchboard = account.borrow<&FungibleTokenSwitchboard.Switchboard>(
          from: FungibleTokenSwitchboard.StoragePath
      )

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
      }
  }
}
`