const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');

describe('NFT Market', function () {
	it('should create and execute market sales', async () => {
		const Market = await ethers.getContractFactory('NFTMarket');
		const market = await Market.deploy();
		await market.deployed();
		const marketAddress = market.address;

		const NFT = await ethers.getContractFactory('NFT');
		const nft = await NFT.deploy(marketAddress);
		await market.deployed();
		const nftAddress = nft.address;

		const listingPrice = (await market.getListingPrice()).toString();
		const nft1 = await nft.createToken('http://token1.com');
		const nft2 = await nft.createToken('http://token2.com');
		const price1 = ethers.utils.parseUnits('0.02', 'ether').toString();
		const price2 = ethers.utils.parseUnits('0.03', 'ether').toString();
		await market.createMarketItem(nftAddress, 1, price1, {
			value: listingPrice,
		});
		await market.createMarketItem(nftAddress, 2, price2, {
			value: listingPrice,
		});

		const [_, buyerAddress, thirdAddress] = await ethers.getSigners();

		await market
			.connect(buyerAddress)
			.createMarketSale(nftAddress, 1, { value: price1 });
		let items = await market.fetchMarketItems();

		items = await Promise.all(
			items.map(async (item) => {
				return {
					price: item.price.toString(),
					tokenId: item.tokenId.toString(),
					seller: item.seller,
					owner: item.owner,
					tokenUri: await nft.tokenURI(item.tokenId.toString()),
				};
			})
		);
		console.log('items', items);
	});
});
