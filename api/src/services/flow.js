import * as fcl from '@onflow/fcl';
import pkg from 'elliptic';
import { SHA3 } from 'sha3';

const { ec } = pkg;
const elC = new ec('p256');

class FlowService {
    constructor(
        minterFlowAddress,
        minterPrivateKeyHex,
        minterAccountIndex
    ) {
        this.minterFlowAddress = minterFlowAddress;
        this.minterPrivateKeyHex = minterPrivateKeyHex;
        this.minterAccountIndex = minterAccountIndex;
    }

    authorizeMinter = () => {
        return async (account = {}) => {
            const user = await this.getAccount(
                this.minterFlowAddress
            );
            const key = user.keys[this.minterAccountIndex];
            console.log('user: ', user.keys);
            console.log(
                'minterAccountIndex: ',
                this.minterAccountIndex
            );
            console.log('key: ', key);
            //      const key = user.keys[parseInt(this.minterAccountIndex, 10)];

            const sign = this.signWithKey;
            const pk = this.minterPrivateKeyHex;

            return {
                ...account,
                tempId: `${user.address}-${key.index}`,
                addr: fcl.sansPrefix(user.address),
                keyId: Number(key.index),
                signingFunction: (signable) => {
                    return {
                        addr: fcl.withPrefix(user.address),
                        keyId: Number(key.index),
                        signature: sign(pk, signable.message),
                    };
                },
            };
        };
    };

    getAccount = async (addr) => {
        const { account } = await fcl.send([fcl.getAccount(addr)]);
        return account;
    };

    signWithKey = (privateKey, msg) => {
        const key = elC.keyFromPrivate(
            Buffer.from(privateKey, 'hex')
        );
        const sig = key.sign(this.hashMsg(msg));
        const n = 32;
        const r = sig.r.toArrayLike(Buffer, 'be', n);
        const s = sig.s.toArrayLike(Buffer, 'be', n);
        return Buffer.concat([r, s]).toString('hex');
    };

    hashMsg = (msg) => {
        const sha = new SHA3(256);
        sha.update(Buffer.from(msg, 'hex'));
        return sha.digest();
    };

    sendTx = async ({
        transaction,
        args,
        proposer,
        authorizations,
        payer,
        skipSeal,
    }) => {
        const response = await fcl.mutate({
            cadence: transaction,
            args: (_arg, _t) => args,
            proposer,
            authorizations,
            payer,
            limit: 9999,
        });

        if (skipSeal) return response;
        return await fcl.tx(response).onceSealed();
    };

    async executeScript({ script, args }) {
        return await fcl.query({
            cadence: script,
            args: (_arg, _t) => args,
        });
    }
}

export { FlowService };
