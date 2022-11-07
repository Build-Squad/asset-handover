import AssetHandover from "../contracts/AssetHandover.cdc"

pub fun main(address: Address): AssetHandover.LockUpInfo {
    let lockUpRef = getAccount(address)
        .getCapability(AssetHandover.LockUpPublicPath)
        .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPublic}>()
        ?? panic("Could not borrow AssetHandover.LockUp reference!")

    return lockUpRef.getInfo()
}
