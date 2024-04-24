import axios from 'axios';
import {
  dappTemplateGitRepoUserAndName,
  dappTemplateGitBranch,
  dappTemplateGitFolder,
  dappTemplateGitSelectOptionFile,
  bareTemplateGitSelectOptionFile,
} from '../cfg/const';

export interface TutorialOption {
  name: string;
  value: string;
  description: string;
}

export async function loadTutorialOpts(): Promise<Array<TutorialOption>> {
  const githubUrl = `https://raw.githubusercontent.com/${dappTemplateGitRepoUserAndName}/${dappTemplateGitBranch}/${dappTemplateGitFolder}/${dappTemplateGitSelectOptionFile}`;

  try {
    const response = await axios.get(githubUrl);
    return response.data as Array<TutorialOption>;
  } catch (error: unknown) {
    throw new Error(`Error fetching JSON: ${(error as Error).message}`);
  }
}

export interface BareTemplateOption {
  name: string;
  value: string;
  description: string;
  tag: string[];
  author: string;
}

export async function loadBareTemplateOpts(): Promise<Array<BareTemplateOption>> {
  const githubUrl = `https://raw.githubusercontent.com/${dappTemplateGitRepoUserAndName}/${dappTemplateGitBranch}/${dappTemplateGitFolder}/${bareTemplateGitSelectOptionFile}`;

  try {
    const response = await axios.get(githubUrl);
    return response.data as Array<BareTemplateOption>;
  } catch (error: unknown) {
    throw new Error(`Error fetching JSON: ${(error as Error).message}`);
  }
}
