import accountConfig from "../../account/account.json";

export function accounts() {
  console.log(
    `Print account list, each account is funded with 42_000_000_00000000 capacity in the genesis block.`
  );
  console.log(accountConfig);
}
