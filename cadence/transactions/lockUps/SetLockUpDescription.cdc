import AssetHandover from "../../contracts/AssetHandover.cdc"

transaction(description: String()) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not borrow AssetHandover.LockUp reference.")

        lockUpRef.setDescription(description: description)
    }
}
