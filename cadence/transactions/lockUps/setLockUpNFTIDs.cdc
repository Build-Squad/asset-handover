import AssetHandover from "../../contracts/AssetHandover.cdc"

transaction(identifier: String, nftIDs: [UInt64]) {
    prepare(account: AuthAccount) {
        let lockUpRef = account.borrow<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not borrow AssetHandover.LockUp reference.")

        lockUpRef.setNFTIDs(identifier: identifier, nftIDs: nftIDs)
    }
}
 