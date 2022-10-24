import AssetHandover from "../contracts/AssetHandover.cdc"

transaction(releasedAt: UFix64) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&{AssetHandover.LockUpPrivate}>(from: AssetHandover.LockUpStoragePath)
            ?? panic("Could not get LockUp reference!")

        lockUpRef.setReleasedAt(releasedAt: releasedAt)
    }
}
