import AssetHandover from "../../contracts/AssetHandover.cdc"

transaction() {
    prepare(account: AuthAccount) {
        let lockUp <- account.load<@AssetHandover.LockUp>(
            from: AssetHandover.LockUpStoragePath
        ) ?? panic("Could not load AssetHandover.LockUp resource.")
        destroy lockUp
    }
}
 