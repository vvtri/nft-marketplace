require('@nomiclabs/hardhat-waffle');

const fs = require('fs');
const privateKey = fs.readFileSync('.secret').toString();

// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
// 	const accounts = await hre.ethers.getSigners();

// 	for (const account of accounts) {
// 		console.log(account.address);
// 	}
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

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
			accounts: [privateKey],
		},
		mainnet: {
			url: 'https://linea-mainnet.infura.io/v3/05044f2861844e9ead402ab87772c844',
			accounts: [privateKey],
		},
	},
};
