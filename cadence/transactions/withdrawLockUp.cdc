import AssetHandover from "../contracts/AssetHandover.cdc"
import FungibleToken from "../contracts/interfaces/FungibleToken.cdc"

transaction(address: Address, amount: UFix64) {
    prepare(account: AuthAccount) {
        account.link<&{FungibleToken.Receiver}>(/public/flowTokenVault, target: /storage/flowTokenVault)
        let receiverCap = account.getCapability<&{FungibleToken.Receiver}>(/public/flowTokenVault)
        let lockUpRef = getAccount(address).getCapability<&{AssetHandover.LockUpPublic}>(AssetHandover.LockUpPublicPath).borrow() ?? panic("Could not borrow LockUp reference")
        lockUpRef.withdraw(amount: amount, receiver: receiverCap)
    }
}
