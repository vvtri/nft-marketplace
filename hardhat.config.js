require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	solidity: '0.8.4',
	networks: {
		hardhat: {
			chainId: 1338,
		},
		mumbai: {
			url: 'https://polygon-amoy.infura.io/v3/05044f2861844e9ead402ab87772c844',
			accounts: [process.env.PRIVATE_KEY],
		},
		polygonMainnet: {
			url: 'https://linea-mainnet.infura.io/v3/05044f2861844e9ead402ab87772c844',
			accounts: [process.env.PRIVATE_KEY],
		},
		sepolia: {
			url: 'https://rpc.ankr.com/eth_sepolia',
			accounts: [process.env.SEPOLIA_MARKET_OWNER_PRIVATE_KEY],
		},
	},
};
