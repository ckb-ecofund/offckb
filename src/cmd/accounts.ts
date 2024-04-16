import accountConfig from '../../account/account.json';
import chalk from 'chalk';

const highlightText = (text: string | number) => {
  return chalk.green(text);
};

const alertText = (text: string | number) => {
  return chalk.bgRed(text);
};

const infoText = (text: string | number) => {
  return chalk.blue(text);
};

export function accounts() {
  console.log(alertText(`#### All Accounts are for test and develop only  ####`.toUpperCase()));
  console.log(alertText(`#### DON'T use these accounts on Mainnet         ####`.toUpperCase()));
  console.log(alertText(`#### Otherwise You will loose your money         ####`.toUpperCase()));
  console.log('');

  console.log(
    infoText(
      `Print account list, each account is funded with 42_000_000_00000000 capacity in the devnet genesis block.`,
    ),
  );

  const item = (index: number, account: (typeof accountConfig)[0]) => {
    return `
- "${highlightText('#')}": ${highlightText(index)}
address: ${highlightText(account.address)}
privkey: ${highlightText(account.privkey)}
pubkey: ${highlightText(account.pubkey)}
lock_arg: ${highlightText(account.lockScript.args)}
lockScript:
    codeHash: ${highlightText(account.lockScript.codeHash)}
    hashType: ${highlightText(account.lockScript.hashType)}
    args: ${highlightText(account.lockScript.args)}`;
  };

  for (let i = 0; i < accountConfig.length; i++) {
    const account = accountConfig[i];
    console.log(item(i, account));
  }
}
