export const destroyLockup = `
import AssetHandover from 0xAssetHandover

transaction() {
  prepare(account: AuthAccount) {
      let lockUp <- account.load<@AssetHandover.LockUp>(
          from: AssetHandover.LockUpStoragePath
      ) ?? panic("Could not load AssetHandover.LockUp resource.")
      destroy lockUp
  }
}
`