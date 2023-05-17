export const getAccountBalance = `
import FungibleToken from 0xFT
import FlowToken from 0xFlowToken

pub fun main(address: Address): UFix64 {
    let balanceRef = getAccount(address)
        .getCapability(/public/flowTokenBalance)
        .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
        ?? panic("Could not borrow FungibleToken.Balance reference")

    return balanceRef.balance
}
`