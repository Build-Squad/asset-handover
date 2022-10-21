import AssetHandover from "../contracts/AssetHandover.cdc"
import FungibleToken from "../contracts/interfaces/FungibleToken.cdc"

transaction(releasedAt: UFix64, recipient: Address) {
    prepare(account: AuthAccount) {
        let providerCap = account.getCapability<&{FungibleToken.Provider}>(AssetHandover.LockUpPrivatePath)
        let lockUp <- AssetHandover.createLockUp(releasedAt: releasedAt, recipient: recipient, providerCap: providerCap)
        account.save<@AssetHandover.LockUp>(<- lockUp, to: AssetHandover.LockUpStoragePath)
        account.link<&AssetHandover.LockUp>(AssetHandover.LockUpPublicPath, target: AssetHandover.LockUpStoragePath)
    }
}
