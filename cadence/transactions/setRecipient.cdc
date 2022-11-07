import AssetHandover from "../contracts/AssetHandover.cdc"

transaction(recipient: Address) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not borrow AssetHandover.LockUp reference!")

        lockUpRef.setRecipient(recipient: recipient)
    }
}
