import AssetHandover from "../../contracts/AssetHandover.cdc"
import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"

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
            releasedAt: releasedAt,
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
