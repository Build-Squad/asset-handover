export const getAccountLockUp = `
import AssetHandover from 0xAssetHandover

pub fun main(address: Address): AssetHandover.LockUpInfo? {
  let lockUpRef = getAccount(address)
      .getCapability(AssetHandover.LockUpPublicPath)
      .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPublic}>()

  return lockUpRef?.getInfo()
}
`