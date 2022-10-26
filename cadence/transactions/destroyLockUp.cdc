import AssetHandover from "../contracts/AssetHandover.cdc"

transaction() {
    let lockUp: @AssetHandover.LockUp

    prepare(account: AuthAccount) {
        self.lockUp <- account.load<@AssetHandover.LockUp>(from: AssetHandover.LockUpStoragePath) ?? panic("Could not load LockUp resource")
    }

    execute {
        AssetHandover.destroyLockUp(lockUp: <- self.lockUp)
    }
}
