import { Separator } from '@inquirer/prompts';
import select from '@inquirer/select';

export async function selectTemplate() {
  const answer = await select({
    message: 'Select a Dapp template',
    choices: [
      {
        name: 'View and Transfer Balance',
        value: 'simple-transfer',
        description: 'a simple Dapp to check CKB balance and transfer CKB',
      },
      {
        name: 'Issue Token via XUDT scripts',
        value: 'xudt',
        description: 'a simple Dapp to issue your own token via XUDT scripts',
      },
      {
        name: 'Write & Read Onchain Message',
        value: 'write-and-read-message',
        description: 'a simple Dapp to store & retrieve data from a Cell',
      },
      {
        name: 'Create Digital Object With Spore scripts',
        value: 'create-nft',
        description: 'a simple Dapp to create on-chain digital object with spore scripts',
      },
      new Separator(),
      {
        name: 'Issue Token With Max Supply Limit via Omnilock And XUDT scripts(coming)',
        value: 'xudt',
        description: 'a simple Dapp to issue your own token with max supply limit via XUDT scripts',
        disabled: true,
      },
    ],
  });

  return answer;
}
