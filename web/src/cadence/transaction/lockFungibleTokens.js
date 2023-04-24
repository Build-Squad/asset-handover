export const lockFungibleTokens = `
import AssetHandover from 0xAssetHandover
import FungibleToken from 0xFT

transaction(fts: {String: UFix64?}) {
  prepare(account: AuthAccount) {
    let ftsLockUp: {String: AssetHandover.FTLockUp} = {}

    let lockUp = account
      .getCapability(AssetHandover.LockUpPrivatePath)
      .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>()
      ?? panic("Could not borrow AssetHandover.LockUpPrivate reference.")

    for key in fts.keys {
      let info = AssetHandover.getFungibleTokenInfoMapping()[key]!
      account.link<&FungibleToken.Vault>(info.privatePath, target: info.storagePath)
      let vault = account.getCapability<&FungibleToken.Vault>(
          info.privatePath
      )

      let balance = fts[key]?? nil
      let ftLockUp = AssetHandover.FTLockUp(vault: vault, balance: balance)
      ftsLockUp.insert(key: key, ftLockUp)
    }

    lockUp.lockFTs(ftsLockUp)
  }
}
`