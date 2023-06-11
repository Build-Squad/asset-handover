export const withdrawNonFungibleToken = `
import AssetHandover from 0xAssetHandover
import FungibleToken from 0xFT
import NonFungibleToken from 0xNFT

transaction(identifier: String, address: Address, nftIDs: [UInt64]?) {
    let lockUp: &{AssetHandover.LockUpPublic}
    let receiverRef: Capability<&{NonFungibleToken.Receiver}>
    let feeTokens: @FungibleToken.Vault

    prepare(account: AuthAccount) {
        self.lockUp = getAccount(address)
            .getCapability(AssetHandover.LockUpPublicPath)
            .borrow<&{AssetHandover.LockUpPublic}>()
            ?? panic("Could not borrow AssetHandover.LockUpPublic reference.")

        let info = AssetHandover.getNonFungibleTokenInfoMapping()[identifier]
            ?? panic("Non-supported token.")

        self.receiverRef = account.getCapability<&{NonFungibleToken.Receiver}>(
            info.publicPath
        )

        if !self.receiverRef.check() {
            panic("You do not own such an NFT Collection.")
        }

        let vault = account.borrow<&FungibleToken.Vault>(
            from: /storage/flowTokenVault
        ) ?? panic("Could not borrow FungibleToken.Vault reference.")

        self.feeTokens <- vault.withdraw(
            amount: AssetHandover.getWithdrawFees()
        )
    }

    execute {
        self.lockUp.withdrawNFT(
            identifier: identifier,
            receiver: self.receiverRef,
            feeTokens: <- self.feeTokens,
            nftIDs: nftIDs
        )
    }
}
`