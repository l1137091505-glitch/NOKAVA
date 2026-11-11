// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title NokavaSignal
/// @notice Records one-way public acknowledgements between BOT Chain addresses.
contract NokavaSignal {
    struct Signal {
        address from;
        address to;
        uint64 sentAt;
    }

    Signal[] private signals;
    mapping(address => uint256) public sentCount;
    mapping(address => uint256) public receivedCount;

    event SignalSent(uint256 indexed signalId, address indexed from, address indexed to, uint64 sentAt);

    function sendSignal(address recipient) external returns (uint256 signalId) {
        require(recipient != address(0), "zero recipient");
        require(recipient != msg.sender, "self signal");

        signalId = signals.length;
        uint64 timestamp = uint64(block.timestamp);
        signals.push(Signal({from: msg.sender, to: recipient, sentAt: timestamp}));
        unchecked {
            sentCount[msg.sender] += 1;
            receivedCount[recipient] += 1;
        }
        emit SignalSent(signalId, msg.sender, recipient, timestamp);
    }

    function totalSignals() external view returns (uint256) {
        return signals.length;
    }

    function signalAt(uint256 signalId) external view returns (Signal memory) {
        return signals[signalId];
    }

    function recentSignals(uint256 limit) external view returns (Signal[] memory result) {
        uint256 total = signals.length;
        uint256 count = limit < total ? limit : total;
        result = new Signal[](count);
        for (uint256 i; i < count; ++i) {
            result[i] = signals[total - 1 - i];
        }
    }
}
