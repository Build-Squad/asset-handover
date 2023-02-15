const defaultPort = 3000;

export function getConfig(env) {
    env = env ?? process.env;

    console.log('ENV = ' + JSON.stringify(env));

    const port = env.PORT || defaultPort;
    const accessApi = env.FLOW_ACCESS_API_URL;
    const assetHandoverAddress = env.ASSET_HANDOVER_ADDRESS;
    const blpTokenAddress = env.BLP_TOKEN_ADDRESS;
    const domainsTokenAddress = env.DOMAINS_TOKEN_ADDRESS;
    const testnet = env.NETWORK;
    const minterAddress = env.MINTER_ADDRESS;
    const minterPrivateKeyHex = env.MINTER_PRIVATE_KEY_HEX;
    const minterAccountKeyIndex = env.MINTER_ACCOUNT_KEY_INDEX;
    const fungibleTokenAddress = env.FUNGIBLE_TOKEN_ADDRESS;
    const nonFungibleTokenAddress = env.NON_FUNGIBLE_TOKEN_ADDRESS;

    return {
        port,
        accessApi,
        assetHandoverAddress,
        testnet,
        minterAddress,
        minterPrivateKeyHex,
        minterAccountKeyIndex,
        fungibleTokenAddress,
        blpTokenAddress,
        domainsTokenAddress,
        nonFungibleTokenAddress,
    };
}
