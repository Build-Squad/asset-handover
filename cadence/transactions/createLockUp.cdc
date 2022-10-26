import AssetHandover from "../contracts/AssetHandover.cdc"
import FlowToken from "../contracts/tokens/FlowToken.cdc"

transaction(releasedAt: UFix64, recipient: Address, balance: UFix64?) {
    prepare(account: AuthAccount) {
        account.link<&FlowToken.Vault>(/private/flowTokenVault, target: /storage/flowTokenVault)
        let vault = account.getCapability<&FlowToken.Vault>(/private/flowTokenVault)

        let lockUp <- AssetHandover.createLockUp(owner: account.address, releasedAt: releasedAt, recipient: recipient, balance: balance, vault: vault)
        account.save<@AssetHandover.LockUp>(<- lockUp, to: AssetHandover.LockUpStoragePath)

        account.link<&{AssetHandover.LockUpPublic}>(AssetHandover.LockUpPublicPath, target: AssetHandover.LockUpStoragePath)
        account.link<&{AssetHandover.LockUpPrivate}>(AssetHandover.LockUpPrivatePath, target: AssetHandover.LockUpStoragePath)

    }

}
