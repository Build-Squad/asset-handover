import AssetHandover from "../contracts/AssetHandover.cdc"
import FungibleToken from "../contracts/interfaces/FungibleToken.cdc"

transaction(releasedAt: UFix64, recipient: Address, balance: UFix64?) {
    prepare(account: AuthAccount) {
        // If we would like to introduce another FungibleToken we will need to specify the
        // path where its Vault will be stored. But even before that we would need to check
        // if the LockUp creator actually owns any such tokens.
        account.link<&FungibleToken.Vault>(/private/flowTokenVault, target: /storage/flowTokenVault)
        let vault = account.getCapability<&FungibleToken.Vault>(
            /private/flowTokenVault
        )

        let lockUp <- AssetHandover.createLockUp(
            releasedAt: releasedAt,
            recipient: recipient,
            balance: balance,
            vault: vault
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
