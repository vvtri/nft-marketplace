// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarket {
    using Counter for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must greater than 0");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        ERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );
    }

    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        idToMarketItem[itemId].seller.transfer(msg.value);
        ERC721(nftContract).transferFrom(address(this), msg.sender, itemId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = itemCount - _itemsSold.current();
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        uint256 currentItemsIdx = 0;

        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                // items[currentItemsIdx] = idToMarketItem[i + 1];
                // currentItemsIdx += 1;

                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem memory item = idToMarketItem[currentId];
                items[currentItemsIdx] = item;
                currentItemsIdx += 1;
            }
        }

        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint256 itemCount;
        uint256 currentItemIdx;

        for (uint256 i; i < totalItemCount; i++) {
            if (msg.sender == idToMarketItem[i + 1].owner) itemCount += 1;
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (msg.sender == idToMarketItem[i + 1].owner) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentItemIdx] = currentItem;
                currentItemIdx += 1;
            }
        }
        return items;
    }

    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 totalItem;
        uint256 currentItemsIdx;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) totalItem += 1;
        }

        MarketItem[] items = new MarketItem[](totalItem);

        for (uint256 i = 0; i < totalItem; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1];
                MarketItem memory item = idToMarketItem[currentId];
                items[currentItemsIdx] = item;
                currentItemsIdx += 1;
            }
        }

        return items;
    }
}
