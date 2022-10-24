import AssetHandover from "../contracts/AssetHandover.cdc"
import FlowToken from "../contracts/tokens/FlowToken.cdc"

transaction(releasedAt: UFix64, recipient: Address) {
    let vaultCap: Capability<&FlowToken.Vault>

    prepare(account: AuthAccount) {
        let lockUp <- AssetHandover.createLockUp(releasedAt: releasedAt, recipient: recipient)
        account.save<@AssetHandover.LockUp>(<- lockUp, to: AssetHandover.LockUpStoragePath)

        account.link<&{AssetHandover.LockUpPublic}>(AssetHandover.LockUpPublicPath, target: AssetHandover.LockUpStoragePath)
        account.link<&{AssetHandover.LockUpPrivate}>(AssetHandover.LockUpPrivatePath, target: AssetHandover.LockUpStoragePath)

        account.link<&FlowToken.Vault>(/private/flowTokenVault, target: /storage/flowTokenVault)
        self.vaultCap = account.getCapability<&FlowToken.Vault>(/private/flowTokenVault)
    }

    execute {
        AssetHandover.registerVault(recipient: recipient, vault: self.vaultCap)
    }
}
