//!note: do not use any accounts from OffCKB for real money!

// ckb devnet miner and faucet from accounts/ckb-miner-and-faucet.key
export const ckbDevnetMinerAccount = {
  privkey: '0x650e256211f5e0beee9084596aa2cb84d11eb033cced5e2d5b191593a9f9f1d4',
  pubkey: '0x0201e68f3db9f4883861a69bc42484378e6d70a0de385e6420448e2c5e7e53d49d',
  lockScript: {
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
    args: '0xa1db2eef3f29f3ef6f86c8d2a0772c705c449f4a',
  },
  address: 'ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdpmvhw70ef70hklpkg62s8wtrst3zf7jshsjzqx',
  args: '0xa1db2eef3f29f3ef6f86c8d2a0772c705c449f4a',
};

// we should keep alice, bob and carol with some testnet balance.
// first account from account/account.json
export const AliceAccount = {
  privkey: '0x6109170b275a09ad54877b82f7d9930f88cab5717d484fb4741ae9d1dd078cd6',
  pubkey: '0x02025fa7b61b2365aa459807b84df065f1949d58c0ae590ff22dd2595157bffefa',
  lockScript: {
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
    args: '0x8e42b1999f265a0078503c4acec4d5e134534297',
  },
  address: 'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvwg2cen8extgq8s5puft8vf40px3f599cytcyd8',
  args: '0x8e42b1999f265a0078503c4acec4d5e134534297',
};

// second account from account/account.json
export const BobAccount = {
  privkey: '0x9f315d5a9618a39fdc487c7a67a8581d40b045bd7a42d83648ca80ef3b2cb4a1',
  pubkey: '0x026efa0579f09cc7c1129b78544f70098c90b2ab155c10746316f945829c034a2d',
  lockScript: {
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
    args: '0x758d311c8483e0602dfad7b69d9053e3f917457d',
  },
  address: 'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqt435c3epyrupszm7khk6weq5lrlyt52lg48ucew',
  args: '0x758d311c8483e0602dfad7b69d9053e3f917457d',
};

// third account from account/account.json
export const CarolAccount = {
  privkey: '0x59ddda57ba06d6e9c5fa9040bdb98b4b098c2fce6520d39f51bc5e825364697a',
  pubkey: '0x02f1ec8d18e8ff13ecf7b3ab8f683d0c3a6d63478a7f7d14ca0fdfe8fea331e863',
  lockScript: {
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
    args: '0x9d1edebedf8f026c0d597c4c5cd3f45dec1f7557',
  },
  address: 'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqvarm0tahu0qfkq6ktuf3wd8azaas0h24c9myfz6',
  args: '0x9d1edebedf8f026c0d597c4c5cd3f45dec1f7557',
};

// we should keep deployerAccount with some testnet balance.
// last account from account/account.json
export const deployerAccount = {
  privkey: '0xace08599f3174f4376ae51fdc30950d4f2d731440382bb0aa1b6b0bd3a9728cd',
  pubkey: '0x0216bc7b5b0a30fb910c372062a7f8cfa89f3a231f5d4a975e60a787ea828aa49e',
  lockScript: {
    codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
    hashType: 'type',
    args: '0x4118c8c16749bf126b22468d030bf9de7da3717b',
  },
  address: 'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsq2prryvze6fhufxkgjx35psh7w70k3hz7c3mtl4d',
  args: '0x4118c8c16749bf126b22468d030bf9de7da3717b',
};
