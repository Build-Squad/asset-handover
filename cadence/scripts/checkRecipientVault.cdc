import AssetHandover from "../contracts/AssetHandover.cdc"
import FlowToken from "../contracts/tokens/FlowToken.cdc"

pub fun main(recipient: Address): Address {
    return AssetHandover.checkRecipientVault(recipient: recipient)
}
