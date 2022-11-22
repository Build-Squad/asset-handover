import AssetHandover from "../../contracts/AssetHandover.cdc"

transaction(identifier: String, balance: UFix64) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not borrow AssetHandover.LockUp reference.")

        lockUpRef.setBalance(identifier: identifier, balance: balance)
    }
}
