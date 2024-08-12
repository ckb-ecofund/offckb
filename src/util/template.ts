import templateOpt from '../../templates/template.json';

export interface BareTemplateOption {
  name: string;
  value: string;
  description: string;
  tag: string[];
  author: string;
}

export function loadBareTemplateOpts(): Array<BareTemplateOption> {
  return templateOpt as Array<BareTemplateOption>;
}
