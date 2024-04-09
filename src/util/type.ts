// network
export enum Network {
  devnet = 'devnet',
  testnet = 'testnet',
  mainnet = 'mainnet',
}

export interface NetworkOption {
  network: Network;
}
