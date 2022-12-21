/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_WRAPPERS_GATEWAY_URL: process.env.NEXT_WRAPPERS_GATEWAY_URL,
    NEXT_ETH_PROVIDER_MAINNET: process.env.NEXT_ETH_PROVIDER_MAINNET,
    NEXT_ETH_PROVIDER_RINKEBY: process.env.NEXT_ETH_PROVIDER_RINKEBY,
    NEXT_ETH_PROVIDER_ROPSTEN: process.env.NEXT_ETH_PROVIDER_ROPSTEN,
    NEXT_ETH_PROVIDER_GOERLI: process.env.NEXT_ETH_PROVIDER_GOERLI,
    NEXT_ETH_PROVIDER_POLYGON: process.env.NEXT_ETH_PROVIDER_POLYGON,
    NEXT_ETH_PROVIDER_LOCALHOST: process.env.NEXT_ETH_PROVIDER_LOCALHOST,
  },
  exportPathMap: function() {
    return {
      '/': { page: '/' },
      '/all': { page: '/all' },
      '/v/ipfs/:cid': { page: '/v/ipfs/[cid]' },
      '/v/ens/:domain': { page: '/v/ens/[network]' },
      '/v/ens/:network/:domain': { page: '/v/ens/[network]/[domain]' },
      '/v/ocr/:network/:ocrContract/:packageIndex': { page: '/v/ocr/[network]/[ocrContract]/[packageIndex]' },
    }
  }
};

module.exports = nextConfig;
