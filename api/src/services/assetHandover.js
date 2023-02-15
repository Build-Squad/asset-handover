import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import * as fs from 'fs';

const assetHandoverPath = '"../../contracts/AssetHandover.cdc"';

class AssetHandoverService {
    constructor(
        assetHandoverAddress,
        fungibleTokenAddress,
        flowService
    ) {
        this.assetHandoverAddress = assetHandoverAddress;
        this.fungibleTokenAddress = fungibleTokenAddress;
        this.flowService = flowService;
    }

    updateCreationFees = async (fees) => {
        const authorization = this.flowService.authorizeMinter();

        const filePath = new URL(
            '../../../cadence/transactions/lockUps/updateCreationFees.cdc',
            import.meta.url
        );
        const transaction = fs
            .readFileSync(filePath, {
                encoding: 'utf8',
            })
            .replace(
                assetHandoverPath,
                fcl.withPrefix(this.assetHandoverAddress)
            );

        return this.flowService.sendTx({
            transaction,
            args: [fcl.arg(fees, t.UFix64)],
            authorizations: [authorization],
            payer: authorization,
            proposer: authorization,
        });
    };

    updateWithdrawFees = async (fees) => {
        const authorization = this.flowService.authorizeMinter();

        const filePath = new URL(
            '../../../cadence/transactions/lockUps/updateCreationFees.cdc',
            import.meta.url
        );
        const transaction = fs
            .readFileSync(filePath, {
                encoding: 'utf8',
            })
            .replace(
                assetHandoverPath,
                fcl.withPrefix(this.assetHandoverAddress)
            );

        return this.flowService.sendTx({
            transaction,
            args: [fcl.arg(fees, t.UFix64)],
            authorizations: [authorization],
            payer: authorization,
            proposer: authorization,
        });
    };

    getFungibleTokenInfoMapping = async () => {
        const filePath = new URL(
            '../../../cadence/scripts/lockups/getFungibleTokenInfoMapping.cdc',
            import.meta.url
        );
        const script = fs
            .readFileSync(filePath, {
                encoding: 'utf8',
            })
            .replace(
                assetHandoverPath,
                fcl.withPrefix(this.assetHandoverAddress)
            );

        return this.flowService.executeScript({
            script,
            args: [],
        });
    };

    getNonFungibleTokenInfoMapping = async () => {
        const filePath = new URL(
            '../../../cadence/scripts/lockups/getNonFungibleTokenInfoMapping.cdc',
            import.meta.url
        );
        const script = fs
            .readFileSync(filePath, {
                encoding: 'utf8',
            })
            .replace(
                assetHandoverPath,
                fcl.withPrefix(this.assetHandoverAddress)
            );

        return this.flowService.executeScript({
            script,
            args: [],
        });
    };

    getAccountLockUp = async (address) => {
        const filePath = new URL(
            '../../../cadence/scripts/lockups/getAccountLockUp.cdc',
            import.meta.url
        );
        const script = fs
            .readFileSync(filePath, {
                encoding: 'utf8',
            })
            .replace(
                assetHandoverPath,
                fcl.withPrefix(this.assetHandoverAddress)
            );

        return this.flowService.executeScript({
            script,
            args: [fcl.arg(address, t.Address)],
        });
    };

    getLockUpsByRecipient = async (address) => {
        const filePath = new URL(
            '../../../cadence/scripts/lockups/getLockUpsByRecipient.cdc',
            import.meta.url
        );
        const script = fs
            .readFileSync(filePath, {
                encoding: 'utf8',
            })
            .replace(
                assetHandoverPath,
                fcl.withPrefix(this.assetHandoverAddress)
            );

        return this.flowService.executeScript({
            script,
            args: [fcl.arg(address, t.Address)],
        });
    };
}

export { AssetHandoverService };
