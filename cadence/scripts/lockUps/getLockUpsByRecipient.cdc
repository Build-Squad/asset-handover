import AssetHandover from "../../contracts/AssetHandover.cdc"

pub fun main(recipient: Address): [AssetHandover.LockUpInfo] {
    let addresses = AssetHandover.lockUpsMapping[recipient]

    if addresses == nil {
        return []
    }

    let lockUpsInfo: [AssetHandover.LockUpInfo] = []

    for address in addresses! {
        let lockUpRef = getAccount(address)
            .getCapability(AssetHandover.LockUpPublicPath)
            .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPublic}>()

        if lockUpRef != nil {
            lockUpsInfo.append(lockUpRef!.getInfo())
        }
    }

    return lockUpsInfo
}
