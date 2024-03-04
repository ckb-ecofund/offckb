import { Separator } from '@inquirer/prompts';
import select from '@inquirer/select';

export async function selectTemplate() {
  const answer = await select({
    message: 'Select a dapp template',
    choices: [
      {
        name: 'Transfer CKB',
        value: 'transfer',
        description: 'a simple dapp to check CKB balance and transfer CKB',
      },
      {
        name: 'Issue Token via XUDT scripts',
        value: 'xudt',
        description: 'a simple dapp to issue your own token via XUDT scripts',
      },
      new Separator(),
      {
        name: 'Issue Token With Max Supply Limit via Omnilock And XUDT scripts(coming)',
        value: 'xudt',
        description: 'a simple dapp to issue your own token with max supply limit via XUDT scripts',
        disabled: true,
      },
      {
        name: 'Create NFT With Spore scripts(coming)',
        value: 'xudt',
        description: 'a simple dapp to issue your own token with XUDT scripts',
        disabled: true,
      },
    ],
  });

  return answer;
}
