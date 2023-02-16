import initApp from './app.js';
import { getConfig } from './config.js';
import dotenv from 'dotenv';
import * as fcl from '@onflow/fcl';
import { AssetHandoverService } from './services/assetHandover.js';
import { BlpTokenService } from './services/blpToken.js';
import { FlowService } from './services/flow.js';
import { DomainsTokenService } from './services/domainsToken.js';

const envVars = dotenv.config({
  path: '.env.local',
});

async function run() {
  const config = getConfig(envVars.parsed);

  const flowService = new FlowService(
    config.minterAddress,
    config.minterPrivateKeyHex,
    config.minterAccountKeyIndex
  );

  // Make sure we're pointing to the correct Flow Access API.
  fcl.config({
    'flow.network': config.testnet,
    'accessNode.api': config.accessApi,
    //'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  });

  const startAPIServer = () => {
    console.log('Starting API server ....');
    console.log('ADDRESS IS: ' + config.assetHandoverAddress);
    console.log(config);
    const assetHandoverService = new AssetHandoverService(
      config.assetHandoverAddress,
      config.fungibleTokenAddress,
      flowService
    );
    const blpTokenService = new BlpTokenService(
      config.blpTokenAddress,
      config.fungibleTokenAddress,
      flowService
    );
    const domainsTokenService = new DomainsTokenService(
      config.domainsTokenAddress,
      config.nonFungibleTokenAddress,
      config.fungibleTokenAddress,
      flowService
    );
    const app = initApp(
      assetHandoverService,
      blpTokenService,
      domainsTokenService
    );

    app.listen(config.port, () => {
      console.log(`Listening on port ${config.port}!`);
    });

    process.on('SIGINT', () => {
      console.info('SIGINT signal received.');
      console.log('Closing API server ....');
      app.close(() => {
        console.log('API server closed ....');
      });
    });
  };
  startAPIServer();
}

const redOutput = '\x1b[31m%s\x1b[0m';

run().catch((e) => {
  console.error(redOutput, e);
  process.exit(1);
});
