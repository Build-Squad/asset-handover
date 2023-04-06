export const createLockUp = `
import AssetHandover from 0xAssetHandover
import FungibleToken from 0xFT

transaction(releasedAt: UFix64, recipient: Address, name: String, description: String) {
    prepare(account: AuthAccount) {
        let vault = account.borrow<&FungibleToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FungibleToken.Vault reference.")

        let feeTokens <- vault.withdraw(
            amount: AssetHandover.getCreationFees()
        )
        let lockUp <- AssetHandover.createLockUp(
            holder: account.address,
            releasedAt: UFix64(releasedAt),
            name: name,
            description: description,
            recipient: recipient,
            feeTokens: <- feeTokens
        )
        account.save<@AssetHandover.LockUp>(<- lockUp, to: AssetHandover.LockUpStoragePath)

        account.link<&AssetHandover.LockUp{AssetHandover.LockUpPublic}>(
            AssetHandover.LockUpPublicPath,
            target: AssetHandover.LockUpStoragePath
        )
        account.link<&AssetHandover.LockUp{AssetHandover.LockUpPrivate}>(
            AssetHandover.LockUpPrivatePath,
            target: AssetHandover.LockUpStoragePath
        )
    }
}
`