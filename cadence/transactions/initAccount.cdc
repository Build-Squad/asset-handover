import AssetHandover from "../contracts/AssetHandover.cdc"
import FungibleToken from "../contracts/interfaces/FungibleToken.cdc"

transaction() {
    prepare(account: AuthAccount) {
        account.link<&{FungibleToken.Provider}>(AssetHandover.LockUpPrivatePath, target: /storage/flowTokenVault)
        account.link<&{FungibleToken.Receiver}>(AssetHandover.LockUpPublicPath, target: /storage/flowTokenVault)
    }
}
