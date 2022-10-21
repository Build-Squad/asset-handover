import AssetHandover from "../contracts/AssetHandover.cdc"
import FungibleToken from "../contracts/interfaces/FungibleToken.cdc"

transaction(address: Address, amount: UFix64) {
    prepare(account: AuthAccount) {
        let receiverCap = account.getCapability<&{FungibleToken.Receiver}>(AssetHandover.LockUpPublicPath)
        let lockUpRef = getAccount(address).getCapability<&AssetHandover.LockUp>(AssetHandover.LockUpPublicPath).borrow() ?? panic("Could not borrow LockUp reference")
        lockUpRef.withdraw(amount: amount, receiver: receiverCap)
    }
}
