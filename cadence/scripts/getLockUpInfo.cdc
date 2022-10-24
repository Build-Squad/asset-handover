import AssetHandover from "../contracts/AssetHandover.cdc"

pub fun main(address: Address): AssetHandover.LockUpInfo {
    let lockUpRef = getAccount(address)
        .getCapability<&{AssetHandover.LockUpPublic}>(AssetHandover.LockUpPublicPath)
        .borrow() ?? panic("Could not borrow LockUp reference!")

    return lockUpRef.getInfo()
}
