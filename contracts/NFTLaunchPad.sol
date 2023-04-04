// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./NFTCollection.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

interface INFTCollection {
    function updatePublicKey(address publicKey, address launchpadAddress)
        external;
}

contract NFTLaunchPad is Initializable, OwnableUpgradeable {
    address[] _allCollections;
    mapping(address => address[]) _userCollections;
    mapping(address => int256) brokerage;
    address platformPublicKey; //Address of Public key

    address public brokerAddress; //Address of broker
    address[] public currencies; //Address of currency

    function initialize(address _brokerAddress, address _platformPublicKey)
        public
        initializer
    {
        __Ownable_init();
        brokerAddress = _brokerAddress;
        platformPublicKey = _platformPublicKey;
    }

    //Event
    event CreateLaunchpad(
        address creator,
        address collection,
        uint256 creationtime,
        string name,
        string symbol,
        string contractURI
    );

    /**
     * @dev Method to add currency addresses.
     * @notice allow only autorized user to call this function.
     * @param newCurrencies new address to be add in an array.
     */
    function addCurrency(address[] calldata newCurrencies) external onlyOwner {
        for (uint256 i = 0; i < newCurrencies.length; i++) {
            currencies.push(newCurrencies[i]);
        }
    }

    /**
     * @dev Method to remove currency addresses.
     * @notice allow only autorized user to call this function.
     * @param newCurrencies list of address to be remove from an array.
     */
    function removeCurrency(address[] calldata newCurrencies)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < newCurrencies.length; i++) {
            for (uint256 j = 0; j < currencies.length; j++) {
                if (currencies[j] == newCurrencies[i]) {
                    currencies[j] = currencies[currencies.length - 1];
                    currencies.pop();
                }
            }
        }
    }

    function getCurrecies() external view returns (address[] memory) {
        return currencies;
    }

    /**
     * @dev Method to set brokerage.
     * @notice allow only autorized user to call this function.
     * @param _brokerage new brokerage.
     * @param currency address of currency
     */

    function setBrokerage(int256 _brokerage, address currency)
        external
        onlyOwner
    {
        brokerage[currency] = _brokerage;
    }

    function getBrokerage(address currency) external view returns (int256) {
        return brokerage[currency];
    }

    /**
     * @dev Method to set broker address.
     * @notice allow only autorized user to call this function.
     * @param newBrokerAddress address of new broker.
     */

    function setBroker(address newBrokerAddress) external onlyOwner {
        require(
            newBrokerAddress != address(0) && newBrokerAddress != brokerAddress,
            "NFTLaunchPad: New address should not be address 0x0 nor existing address"
        );
        brokerAddress = newBrokerAddress;
    }

    /**
     * @dev Method to set PlatfromPublicKey
     * @notice allow only authorized user to call this function
     * @param _newPlatformPublicKey to be set
     */

    function updatePublicKey(address _newPlatformPublicKey) external onlyOwner {
        platformPublicKey = _newPlatformPublicKey;
    }

    /**
     * @dev Method to update platformPublicKey of a collection
     * @notice allow only authorized user to call this function
     * @param collection where new public key to be update
     */

    function updateCollectionPlatFormPublicKey(address collection)
        external
        onlyOwner
    {
        INFTCollection object = INFTCollection(collection);
        return object.updatePublicKey(platformPublicKey, address(this));
    }

    /**
     * @dev Method to create new NFTLaunchPad.
     * @param _uints struct of integer values used to create launchPad
     * @param _strings struct of string used to create launchPad
     * @return Return the address of new create launchPad
     */

    function createLaunchPad(
        NFTCollection.UintArgs calldata _uints,
        NFTCollection.StringArgs calldata _strings
    ) external returns (address) {
        NFTCollection launchpadCollection = new NFTCollection(
            _uints,
            msg.sender,
            _strings,
            brokerAddress,
            platformPublicKey
        );
        _allCollections.push(address(launchpadCollection));
        _userCollections[msg.sender].push(address(launchpadCollection));
        emit CreateLaunchpad(
            msg.sender,
            address(launchpadCollection),
            block.timestamp,
            _strings.name,
            _strings.symbol,
            _strings.contractURI
        );
        return address(launchpadCollection);
    }

    /**
     * @dev Method to get all created LaunchPad.
     * @return return array of created collections.
     */

    function getCollections() external view returns (address[] memory) {
        return _allCollections;
    }

    /**
     * @dev Method to get created LaunchPad of specific user.
     * @param user: address of user to get their collections
     * @return return array of created collections of user.
     */

    function getUserCollection(address user)
        external
        view
        returns (address[] memory)
    {
        return _userCollections[user];
    }
}
