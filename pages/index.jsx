import axios from 'axios';
import * as ethers from 'ethers';
import Web3Model from 'web3modal';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import { nftAddress, nftMarketAddress } from '../config';
import { useEffect, useState } from 'react';

export default function Home() {
	const [nfts, setNfts] = useState([]);
	const [loadingState, setLoadingState] = useState('not-loading');

	useEffect(() => {
		loadNFTs();
	}, []);

	const loadNFTs = async () => {
		const provider = new ethers.providers.JsonRpcProvider();
		const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
		const marketContract = new ethers.Contract(
			nftMarketAddress,
			Market.abi,
			provider
		);

		const data = await marketContract.fetchMarketItems();
		const items = await Promise.all(
			data.map(async (i) => {
				const tokenUri = await tokenContract.tokenURI(i.tokenId);
				const meta = await axios.get(tokenUri);
				let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
				let item = {
					price,
					tokenId: i.tokenId.toNumber(),
					seller: i.seller,
					owner: i.owner,
					image: meta.data.image,
					name: meta.data.name,
					description: meta.data.description,
				};
				return item;
			})
		);
		setNfts(items);
		setLoadingState('loaded');
	};

	const buyNFT = async (nft) => {
		const web3Model = new Web3Model();
		const connection = await web3Model.connect();
		const provider = new ethers.providers.Web3Provider(connection);

		const signer = provider.getSigner();
		const nftMarket = new ethers.Contract(nftMarketAddress, Market.abi, signer);

		const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
		const transaction = await nftMarket.createMarketSale(
			nftAddress,
			nft.itemId,
			{ value: price }
		);
		await transaction.wait();
		loadNFTs();
	};

	if (loadingState === 'loaded' && !nfts.length)
		return <h1 className='px-28 py-10 text-3xl'>No item in the marketplace</h1>;

	return (
		<div className='flex justify-center'>
			<div className='p-4 max-w-[1600px]'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
					{nfts.map((nft) => (
						<div
							key={nft.itemId}
							className='border rounded-lg shadow overflow-hidden'
						>
							<img src={nft.image} className='w-full object-contain' />

							<div className='p4'>
								<p className='h-8 text-2xl font-semibold'>{nft.name}</p>
								<div className='h-[70px] overflow-hidden'>
									<p className='text-gray-400'>{nft.description}</p>
								</div>
							</div>

							<div className='p-4 bg-black'>
								<p className='text-2xl mb-4 font-bold text-white'>
									{nft.price} Matic
								</p>
								<button
									className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded'
									onClick={() => buyNFT(nft)}
								>
									Buy NFT
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
