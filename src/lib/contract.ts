import { parseAbi } from "viem";

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0xA10E0a8A447CdEC77E83A83DA46B3DC5F33d211F") as `0x${string}`;

export const HIDDEN_METADATA_URI =
  "ipfs://bafkreihjt43rtffxphou6qrj2ev36wzvuby2ebajfcjp5hhle2mktx5xii";

// Used to pre-fill the owner dashboard's reveal form (Phase 8).
export const REVEALED_METADATA_URI =
  "ipfs://bafkreibovmugkkmu3tdq4rzjdhvzmwvrbco2wushjvhlttvslf5nsw2smu";

export const nftMinterAbi = parseAbi([
  // --- reads ---
  "function MAX_SUPPLY() view returns (uint256)",
  "function MAX_PER_WALLET() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function remainingSupply() view returns (uint256)",
  "function remainingWalletMints(address user) view returns (uint256)",
  "function walletMintCount(address) view returns (uint256)",
  "function getMintCost(uint256 quantity) view returns (uint256)",
  "function mintingEnabled() view returns (bool)",
  "function paused() view returns (bool)",
  "function revealed() view returns (bool)",
  "function hiddenMetadataURI() view returns (string)",
  "function revealedMetadataURI() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function owner() view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // --- public write ---
  "function mint(uint256 quantity) payable",

  // --- owner writes ---
  "function setMintingEnabled(bool enabled)",
  "function setMintPrice(uint256 newPrice)",
  "function pause()",
  "function unpause()",
  "function reveal(string metadataURI)",
  "function withdraw()",

  // --- events ---
  "event NFTMinted(address indexed minter, uint256 quantity)",
  "event CollectionRevealed(string metadataURI)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",

  // --- custom errors (for decoding failed transactions) ---
  "error MintingDisabled()",
  "error InvalidQuantity()",
  "error MaxSupplyExceeded()",
  "error WalletLimitExceeded()",
  "error IncorrectPayment()",
  "error InvalidURI()",
  "error AlreadyRevealed()",
  "error NothingToWithdraw()",
  "error WithdrawalFailed()",
  "error DirectPaymentNotAllowed()",
  "error EnforcedPause()",
  "error ExpectedPause()",
  "error OwnableUnauthorizedAccount(address account)",
  "error ReentrancyGuardReentrantCall()",
]);