// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FacilitatorIdentityRegistry
 * @notice ERC-721 based registry for x402 Facilitator Network agents
 * @dev Implements ERC-8004 Identity Registry for facilitator discovery and identity
 */
contract FacilitatorIdentityRegistry is ERC721URIStorage, Ownable {
    // Metadata storage
    struct MetadataEntry {
        string key;
        bytes value;
    }

    // facilitatorId => key => value
    mapping(uint256 => mapping(string => bytes)) private _metadata;

    // Counter for facilitator IDs
    uint256 private _nextFacilitatorId = 1;

    // Events
    event Registered(
        uint256 indexed facilitatorId,
        string tokenURI,
        address indexed owner
    );

    event MetadataSet(
        uint256 indexed facilitatorId,
        string indexed indexedKey,
        string key,
        bytes value
    );

    constructor() ERC721("x402 Facilitator", "FAC402") Ownable(msg.sender) {}

    /**
     * @notice Register a new facilitator
     * @param tokenURI_ URI pointing to facilitator registration file (IPFS or HTTPS)
     * @param metadata Optional on-chain metadata entries
     * @return facilitatorId The newly created facilitator ID
     */
    function register(
        string memory tokenURI_,
        MetadataEntry[] calldata metadata
    ) external returns (uint256 facilitatorId) {
        facilitatorId = _nextFacilitatorId++;

        _safeMint(msg.sender, facilitatorId);
        _setTokenURI(facilitatorId, tokenURI_);

        // Set metadata if provided
        for (uint256 i = 0; i < metadata.length; i++) {
            _setMetadata(facilitatorId, metadata[i].key, metadata[i].value);
        }

        emit Registered(facilitatorId, tokenURI_, msg.sender);
    }

    /**
     * @notice Register a new facilitator without metadata
     * @param tokenURI_ URI pointing to facilitator registration file
     * @return facilitatorId The newly created facilitator ID
     */
    function register(string memory tokenURI_)
        external
        returns (uint256 facilitatorId)
    {
        facilitatorId = _nextFacilitatorId++;

        _safeMint(msg.sender, facilitatorId);
        _setTokenURI(facilitatorId, tokenURI_);

        emit Registered(facilitatorId, tokenURI_, msg.sender);
    }

    /**
     * @notice Register a new facilitator (tokenURI set later)
     * @return facilitatorId The newly created facilitator ID
     */
    function register() external returns (uint256 facilitatorId) {
        facilitatorId = _nextFacilitatorId++;

        _safeMint(msg.sender, facilitatorId);

        emit Registered(facilitatorId, "", msg.sender);
    }

    /**
     * @notice Get metadata for a facilitator
     * @param facilitatorId The facilitator ID
     * @param key The metadata key
     * @return value The metadata value
     */
    function getMetadata(uint256 facilitatorId, string calldata key)
        external
        view
        returns (bytes memory)
    {
        require(_ownerOf(facilitatorId) != address(0), "Facilitator does not exist");
        return _metadata[facilitatorId][key];
    }

    /**
     * @notice Set metadata for a facilitator
     * @param facilitatorId The facilitator ID
     * @param key The metadata key
     * @param value The metadata value
     */
    function setMetadata(
        uint256 facilitatorId,
        string calldata key,
        bytes calldata value
    ) external {
        require(
            ownerOf(facilitatorId) == msg.sender,
            "Only owner can set metadata"
        );
        _setMetadata(facilitatorId, key, value);
    }

    /**
     * @notice Internal function to set metadata
     */
    function _setMetadata(
        uint256 facilitatorId,
        string memory key,
        bytes memory value
    ) internal {
        _metadata[facilitatorId][key] = value;
        emit MetadataSet(facilitatorId, key, key, value);
    }

    /**
     * @notice Get total number of registered facilitators
     */
    function totalFacilitators() external view returns (uint256) {
        return _nextFacilitatorId - 1;
    }

    /**
     * @notice Update token URI (registration file)
     * @param facilitatorId The facilitator ID
     * @param newTokenURI New URI
     */
    function updateTokenURI(uint256 facilitatorId, string memory newTokenURI)
        external
    {
        require(
            ownerOf(facilitatorId) == msg.sender,
            "Only owner can update URI"
        );
        _setTokenURI(facilitatorId, newTokenURI);
    }
}
