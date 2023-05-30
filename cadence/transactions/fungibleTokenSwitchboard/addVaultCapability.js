import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';

const args = process.argv.slice(2);

const contractIdentifier = args[0];
if (contractIdentifier === undefined) {
  console.error('You need to pass the contract identifier as an argument.');
  process.exit(1);
}

const signer = args[1];
if (signer === undefined) {
  console.error('You need to pass the signer as an argument.');
  process.exit(1);
}

const [_, contractAddress, contractName] = contractIdentifier.split('.');

try {
  const filePath = new URL('./addVaultCapabilityTemplate.cdc', import.meta.url);
  const transactionTemplate = readFileSync(filePath, { encoding: 'utf8' });

  const transaction = transactionTemplate.replaceAll(
    'CONTRACT_NAME',
    contractName
  )
  .replaceAll(
    'CONTRACT_ADDRESS',
    contractAddress
  );

  const transactionPath = './cadence/transactions/fungibleTokenSwitchboard/addVaultCapability.cdc';
  writeFileSync(
    transactionPath,
    transaction
  );

  const transactionCommand = `
    flow transactions send ${transactionPath} ${contractIdentifier} --network=emulator --signer=${signer}
  `;

  exec(transactionCommand, (err, output) => {
    if (err) {
      console.error("Error while sending transaction: ", err);
      return;
    }

  });
} catch (err) {
  console.error(err.message);
}
