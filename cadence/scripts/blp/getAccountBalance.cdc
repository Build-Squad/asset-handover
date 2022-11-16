import FungibleToken from "../../contracts/interfaces/FungibleToken.cdc"
import BlpToken from "../../contracts/tokens/BlpToken.cdc"

pub fun main(address: Address): UFix64 {
    let balanceRef = getAccount(address)
        .getCapability(BlpToken.balancePath)
        .borrow<&BlpToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow FungibleToken.Balance reference")

    return balanceRef.balance
}
