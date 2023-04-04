import AssetHandover from "../../contracts/AssetHandover.cdc"

transaction(name: String) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not borrow AssetHandover.LockUp reference.")

        lockUpRef.setName(name: name)
    }
}
