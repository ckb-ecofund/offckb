import select from '@inquirer/select';

export async function selectTemplate() {
  const answer = await select({
    message: 'Select a dapp template',
    choices: [
      {
        name: 'Transfer CKB',
        value: 'transfer',
        description: 'a simple dapp to check CKB balance and transfer CKB from address to address',
      },
      {
        name: 'Issue Coin With XUDT scripts',
        value: 'xudt',
        description: 'a simple dapp to issue your own token with XUDT scripts',
      },
    ],
  });

  return answer;
}
