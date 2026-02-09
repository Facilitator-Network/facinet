// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FacilitatorIdentityRegistry.sol";

/**
 * @title FacilitatorReputationRegistry
 * @notice Reputation system for x402 Facilitator Network
 * @dev Implements ERC-8004 Reputation Registry for feedback and trust signals
 */
contract FacilitatorReputationRegistry {
    // Reference to Identity Registry
    FacilitatorIdentityRegistry public immutable identityRegistry;

    // Feedback structure
    struct Feedback {
        uint8 score; // 0-100
        bytes32 tag1; // e.g., "responseTime", "fast", "slow"
        bytes32 tag2; // e.g., "paymentType", "small", "large"
        bool isRevoked;
    }

    // facilitatorId => clientAddress => feedbackIndex => Feedback
    mapping(uint256 => mapping(address => mapping(uint64 => Feedback)))
        private _feedback;

    // facilitatorId => clientAddress => lastFeedbackIndex
    mapping(uint256 => mapping(address => uint64)) private _lastIndex;

    // facilitatorId => list of client addresses that gave feedback
    mapping(uint256 => address[]) private _clients;

    // facilitatorId => clientAddress => bool (to check if client already added)
    mapping(uint256 => mapping(address => bool)) private _isClient;

    // requestHash => responseUri => responseHash => responder
    struct Response {
        address responder;
        string uri;
        bytes32 hash;
    }
    mapping(uint256 => mapping(address => mapping(uint64 => Response[])))
        private _responses;

    // Events
    event NewFeedback(
        uint256 indexed facilitatorId,
        address indexed clientAddress,
        uint8 score,
        bytes32 indexed tag1,
        bytes32 tag2,
        string fileuri,
        bytes32 filehash
    );

    event FeedbackRevoked(
        uint256 indexed facilitatorId,
        address indexed clientAddress,
        uint64 indexed feedbackIndex
    );

    event ResponseAppended(
        uint256 indexed facilitatorId,
        address indexed clientAddress,
        uint64 feedbackIndex,
        address indexed responder,
        string responseUri
    );

    constructor(address _identityRegistry) {
        identityRegistry = FacilitatorIdentityRegistry(_identityRegistry);
    }

    /**
     * @notice Get the Identity Registry address
     */
    function getIdentityRegistry() external view returns (address) {
        return address(identityRegistry);
    }

    /**
     * @notice Give feedback for a facilitator
     * @param facilitatorId The facilitator being rated
     * @param score Rating from 0-100
     * @param tag1 First tag (e.g., keccak256("fast"), keccak256("slow"))
     * @param tag2 Second tag (e.g., keccak256("small"), keccak256("large"))
     * @param fileuri IPFS or HTTPS URI with detailed feedback
     * @param filehash KECCAK-256 hash of file content (optional for IPFS)
     * @param feedbackAuth Signature from facilitator authorizing feedback
     */
    function giveFeedback(
        uint256 facilitatorId,
        uint8 score,
        bytes32 tag1,
        bytes32 tag2,
        string calldata fileuri,
        bytes32 filehash,
        bytes memory feedbackAuth
    ) external {
        // Verify facilitator exists
        require(
            identityRegistry.ownerOf(facilitatorId) != address(0),
            "Facilitator does not exist"
        );

        // Verify score is 0-100
        require(score <= 100, "Score must be 0-100");

        // TODO: Verify feedbackAuth signature (EIP-191 or ERC-1271)
        // For now, we allow any merchant to give feedback
        // In production, implement proper signature verification

        address clientAddress = msg.sender;
        uint64 feedbackIndex = _lastIndex[facilitatorId][clientAddress];

        // Store feedback
        _feedback[facilitatorId][clientAddress][feedbackIndex] = Feedback({
            score: score,
            tag1: tag1,
            tag2: tag2,
            isRevoked: false
        });

        // Increment index
        _lastIndex[facilitatorId][clientAddress] = feedbackIndex + 1;

        // Add client to list if first time
        if (!_isClient[facilitatorId][clientAddress]) {
            _clients[facilitatorId].push(clientAddress);
            _isClient[facilitatorId][clientAddress] = true;
        }

        emit NewFeedback(
            facilitatorId,
            clientAddress,
            score,
            tag1,
            tag2,
            fileuri,
            filehash
        );
    }

    /**
     * @notice Revoke feedback
     * @param facilitatorId The facilitator ID
     * @param feedbackIndex The index of feedback to revoke
     */
    function revokeFeedback(uint256 facilitatorId, uint64 feedbackIndex)
        external
    {
        require(
            feedbackIndex < _lastIndex[facilitatorId][msg.sender],
            "Feedback does not exist"
        );

        _feedback[facilitatorId][msg.sender][feedbackIndex].isRevoked = true;

        emit FeedbackRevoked(facilitatorId, msg.sender, feedbackIndex);
    }

    /**
     * @notice Append response to feedback
     * @param facilitatorId The facilitator ID
     * @param clientAddress The client who gave feedback
     * @param feedbackIndex The feedback index
     * @param responseUri URI with response data
     * @param responseHash KECCAK-256 hash of response
     */
    function appendResponse(
        uint256 facilitatorId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseUri,
        bytes32 responseHash
    ) external {
        require(
            feedbackIndex < _lastIndex[facilitatorId][clientAddress],
            "Feedback does not exist"
        );

        _responses[facilitatorId][clientAddress][feedbackIndex].push(
            Response({
                responder: msg.sender,
                uri: responseUri,
                hash: responseHash
            })
        );

        emit ResponseAppended(
            facilitatorId,
            clientAddress,
            feedbackIndex,
            msg.sender,
            responseUri
        );
    }

    /**
     * @notice Get reputation summary
     * @param facilitatorId The facilitator ID
     * @param clientAddresses Filter by specific clients (empty = all)
     * @param tag1 Filter by tag1 (bytes32(0) = no filter)
     * @param tag2 Filter by tag2 (bytes32(0) = no filter)
     * @return count Total feedback count
     * @return averageScore Average score
     */
    function getSummary(
        uint256 facilitatorId,
        address[] calldata clientAddresses,
        bytes32 tag1,
        bytes32 tag2
    ) external view returns (uint64 count, uint8 averageScore) {
        address[] memory clients = clientAddresses.length > 0
            ? clientAddresses
            : _clients[facilitatorId];

        uint256 totalScore = 0;
        count = 0;

        for (uint256 i = 0; i < clients.length; i++) {
            address client = clients[i];
            uint64 lastIdx = _lastIndex[facilitatorId][client];

            for (uint64 j = 0; j < lastIdx; j++) {
                Feedback memory fb = _feedback[facilitatorId][client][j];

                // Skip revoked
                if (fb.isRevoked) continue;

                // Apply filters
                if (tag1 != bytes32(0) && fb.tag1 != tag1) continue;
                if (tag2 != bytes32(0) && fb.tag2 != tag2) continue;

                totalScore += fb.score;
                count++;
            }
        }

        averageScore = count > 0 ? uint8(totalScore / count) : 0;
    }

    /**
     * @notice Read specific feedback
     */
    function readFeedback(
        uint256 facilitatorId,
        address clientAddress,
        uint64 index
    )
        external
        view
        returns (
            uint8 score,
            bytes32 tag1,
            bytes32 tag2,
            bool isRevoked
        )
    {
        Feedback memory fb = _feedback[facilitatorId][clientAddress][index];
        return (fb.score, fb.tag1, fb.tag2, fb.isRevoked);
    }

    /**
     * @notice Get all clients who gave feedback
     */
    function getClients(uint256 facilitatorId)
        external
        view
        returns (address[] memory)
    {
        return _clients[facilitatorId];
    }

    /**
     * @notice Get last feedback index for a client
     */
    function getLastIndex(uint256 facilitatorId, address clientAddress)
        external
        view
        returns (uint64)
    {
        return _lastIndex[facilitatorId][clientAddress];
    }

    /**
     * @notice Get response count for feedback
     */
    function getResponseCount(
        uint256 facilitatorId,
        address clientAddress,
        uint64 feedbackIndex
    ) external view returns (uint64) {
        return
            uint64(_responses[facilitatorId][clientAddress][feedbackIndex].length);
    }

    /**
     * @notice Read all feedback for a facilitator
     */
    function readAllFeedback(
        uint256 facilitatorId,
        address[] calldata clientAddresses,
        bytes32 tag1,
        bytes32 tag2,
        bool includeRevoked
    )
        external
        view
        returns (
            address[] memory clients,
            uint8[] memory scores,
            bytes32[] memory tag1s,
            bytes32[] memory tag2s,
            bool[] memory revokedStatuses
        )
    {
        address[] memory clientList = clientAddresses.length > 0
            ? clientAddresses
            : _clients[facilitatorId];

        // First pass: count total feedback
        uint256 totalCount = 0;
        for (uint256 i = 0; i < clientList.length; i++) {
            totalCount += _lastIndex[facilitatorId][clientList[i]];
        }

        // Initialize arrays
        clients = new address[](totalCount);
        scores = new uint8[](totalCount);
        tag1s = new bytes32[](totalCount);
        tag2s = new bytes32[](totalCount);
        revokedStatuses = new bool[](totalCount);

        // Second pass: populate arrays
        uint256 idx = 0;
        for (uint256 i = 0; i < clientList.length; i++) {
            address client = clientList[i];
            uint64 lastIdx = _lastIndex[facilitatorId][client];

            for (uint64 j = 0; j < lastIdx; j++) {
                Feedback memory fb = _feedback[facilitatorId][client][j];

                // Apply filters
                if (!includeRevoked && fb.isRevoked) continue;
                if (tag1 != bytes32(0) && fb.tag1 != tag1) continue;
                if (tag2 != bytes32(0) && fb.tag2 != tag2) continue;

                clients[idx] = client;
                scores[idx] = fb.score;
                tag1s[idx] = fb.tag1;
                tag2s[idx] = fb.tag2;
                revokedStatuses[idx] = fb.isRevoked;
                idx++;
            }
        }

        // Trim arrays if some were filtered out
        if (idx < totalCount) {
            address[] memory trimmedClients = new address[](idx);
            uint8[] memory trimmedScores = new uint8[](idx);
            bytes32[] memory trimmedTag1s = new bytes32[](idx);
            bytes32[] memory trimmedTag2s = new bytes32[](idx);
            bool[] memory trimmedRevoked = new bool[](idx);

            for (uint256 i = 0; i < idx; i++) {
                trimmedClients[i] = clients[i];
                trimmedScores[i] = scores[i];
                trimmedTag1s[i] = tag1s[i];
                trimmedTag2s[i] = tag2s[i];
                trimmedRevoked[i] = revokedStatuses[i];
            }

            return (
                trimmedClients,
                trimmedScores,
                trimmedTag1s,
                trimmedTag2s,
                trimmedRevoked
            );
        }

        return (clients, scores, tag1s, tag2s, revokedStatuses);
    }
}
