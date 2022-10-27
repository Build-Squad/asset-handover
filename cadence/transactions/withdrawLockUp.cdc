import AssetHandover from "../contracts/AssetHandover.cdc"
import FungibleToken from "../contracts/interfaces/FungibleToken.cdc"
import FlowToken from "../contracts/tokens/FlowToken.cdc"

transaction(address: Address, amount: UFix64) {
    prepare(account: AuthAccount) {
        // If we integrate another FungibleToken, then we need to get the receiver
        // from its respective public path.
        let receiverCap = account.getCapability<&FlowToken.Vault{FungibleToken.Receiver}>(
            /public/flowTokenReceiver
        )
        let lockUpRef = getAccount(address)
            .getCapability(AssetHandover.LockUpPublicPath)
            .borrow<&AssetHandover.LockUp{AssetHandover.LockUpPublic}>()
            ?? panic("Could not borrow AssetHandover.LockUp reference")
        lockUpRef.withdraw(amount: amount, receiver: receiverCap)
    }
}
