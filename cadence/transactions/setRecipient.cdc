import AssetHandover from "../contracts/AssetHandover.cdc"

transaction(recipient: Address) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&{AssetHandover.LockUpPrivate}>(from: AssetHandover.LockUpStoragePath)
            ?? panic("Could not get LockUp reference!")

        lockUpRef.setRecipient(recipient: recipient)
    }
}
