import FUSD from "../../../contracts/tokens/FUSD.cdc"

transaction(minterAddress: Address) {
    let resourceStoragePath: StoragePath
    let capabilityPrivatePath: CapabilityPath
    let minterCapability: Capability<&FUSD.Minter>

    prepare(adminAccount: AuthAccount) {
        self.resourceStoragePath = /storage/admin_minter
        self.capabilityPrivatePath = /private/admin_minter

        let tokenAdmin = adminAccount.borrow<&FUSD.Administrator>(from: FUSD.AdminStoragePath)
            ?? panic("Could not borrow a reference to the admin resource")

        let minter <- tokenAdmin.createNewMinter()
        
        adminAccount.save(<- minter, to: self.resourceStoragePath)
        
        self.minterCapability = adminAccount.link<&FUSD.Minter>(
            self.capabilityPrivatePath,
            target: self.resourceStoragePath
        ) ?? panic("Could not link minter")
    }

    execute {
        let minterAccount = getAccount(minterAddress)

        let capabilityReceiver = minterAccount.getCapability
            <&FUSD.MinterProxy{FUSD.MinterProxyPublic}>
            (FUSD.MinterProxyPublicPath)
            .borrow() ?? panic("Could not borrow capability receiver reference")

        capabilityReceiver.setMinterCapability(cap: self.minterCapability)
    }
}
