import { validateExecDappEnvironment } from '../util/validator';

export function syncConfig() {
  validateExecDappEnvironment();

  //todo: sync my-scripts.json
  console.log('my-scripts.json config updated.');
}
