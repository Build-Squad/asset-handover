export const updateLockUp = `
import AssetHandover from 0xAssetHandover

transaction(releasedAt: UInt64, name: String, description: String, recipient: Address) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not borrow AssetHandover.LockUp reference.")

        lockUpRef.setReleasedAt(releasedAt: releasedAt)
        lockUpRef.setName(name: name)
        lockUpRef.setDescription(description: description)
        lockUpRef.setRecipient(recipient: recipient)
    }
}
`