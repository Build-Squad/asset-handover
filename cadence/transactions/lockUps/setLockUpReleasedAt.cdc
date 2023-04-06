import AssetHandover from "../../contracts/AssetHandover.cdc"

transaction(releasedAt: UInt64) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not get AssetHandover.LockUp reference.")

        lockUpRef.setReleasedAt(releasedAt: releasedAt)
    }
}
