import { readFileSync, writeFileSync } from 'fs';
import { exec, execSync } from 'child_process';

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
  const scriptPath = './cadence/scripts/lockUps/getNFTLinkedTypes.cdc';
  const scriptCommand = `
    flow scripts execute ${scriptPath}  ${contractIdentifier} --network=emulator --output=json
  `;

  let publicType = '';
  let privateType = '';

  const output = execSync(scriptCommand);
  const result = JSON.parse(output);

  result.value.forEach(e => {
    let type = e['value']['value'].replace(/A\.\w{16}\./g, '');
    if (e['key']['value'] == 'publicType') {
      publicType = type;
    }
    if (e['key']['value'] == 'privateType') {
      privateType = type;
    }
  });

  const filePath = new URL('./initCollectionTemplate.cdc', import.meta.url);
  const transactionTemplate = readFileSync(filePath, { encoding: 'utf8' });

  const transaction = transactionTemplate.replaceAll(
    'CONTRACT_NAME',
    contractName
  )
  .replaceAll(
    'CONTRACT_ADDRESS',
    contractAddress
  ).replaceAll(
    'PUBLIC_TYPE',
    publicType
  )
  .replaceAll(
    'PRIVATE_TYPE',
    privateType
  );

  const transactionPath = './cadence/transactions/lockUps/initCollection.cdc';
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
