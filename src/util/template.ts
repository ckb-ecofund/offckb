import {
  dappTemplateGitRepoUserAndName,
  dappTemplateGitBranch,
  dappTemplateGitFolder,
  bareTemplateGitSelectOptionFile,
} from '../cfg/const';
import { Request } from './request';

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
    const response = await Request.get(githubUrl);
    return response.data as Array<BareTemplateOption>;
  } catch (error: unknown) {
    throw new Error(`Error fetching JSON: ${(error as Error).message}`);
  }
}
