import axios from 'axios';
import {
  dappTemplateGitRepoUserAndName,
  dappTemplateGitBranch,
  dappTemplateGitFolder,
  dappTemplateGitSelectOptionFile,
} from '../cfg/const';

export interface TemplateOption {
  name: string;
  value: string;
  description: string;
  type: 'tutorial' | 'template';
}

export async function loadTemplateOpts(): Promise<Array<TemplateOption>> {
  const githubUrl = `https://raw.githubusercontent.com/${dappTemplateGitRepoUserAndName}/${dappTemplateGitBranch}/${dappTemplateGitFolder}/${dappTemplateGitSelectOptionFile}`;

  try {
    const response = await axios.get(githubUrl);
    return response.data as Array<TemplateOption>;
  } catch (error: unknown) {
    throw new Error(`Error fetching JSON: ${(error as Error).message}`);
  }
}
