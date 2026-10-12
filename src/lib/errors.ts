import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";

const MESSAGES: Record<string, string> = {
  MintingDisabled: "Minting isn't open yet.",
  EnforcedPause: "Minting is paused right now.",
  ExpectedPause: "The contract isn't paused.",
  InvalidQuantity: "Invalid quantity. Choose between 1 and 5.",
  MaxSupplyExceeded: "Not enough NFTs left to mint that many.",
  WalletLimitExceeded: "That would exceed your per-wallet limit.",
  IncorrectPayment: "Payment didn't match the mint price. Refresh and try again.",
  InvalidURI: "The metadata URI is invalid.",
  AlreadyRevealed: "The collection is already revealed.",
  NothingToWithdraw: "There's nothing to withdraw.",
  WithdrawalFailed: "Withdrawal failed.",
  OwnableUnauthorizedAccount: "Only the contract owner can do that.",
  ReentrancyGuardReentrantCall: "Transaction conflict. Try again.",
};

export function friendlyError(err: unknown): string {
  if (!(err instanceof BaseError)) return "Something went wrong. Please try again.";

  if (err.walk((e) => e instanceof UserRejectedRequestError)) {
    return "You rejected the transaction in your wallet.";
  }

  const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
  if (revert instanceof ContractFunctionRevertedError) {
    const name = revert.data?.errorName;
    if (name && MESSAGES[name]) return MESSAGES[name];
  }

  if (/insufficient funds/i.test(err.message)) {
    return "Not enough Sepolia ETH to cover the price plus gas.";
  }
  return err.shortMessage;
}