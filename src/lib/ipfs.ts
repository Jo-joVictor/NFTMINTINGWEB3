export const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
];

export function ipfsToHttp(uri: string, gateway = 0): string {
  if (!uri) return "";
  if (/^https?:\/\//.test(uri)) return uri;
  const path = uri.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
  return GATEWAYS[gateway % GATEWAYS.length] + path;
}