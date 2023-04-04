// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "./interfaces/IERC20.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

interface INFTLaunchPad {
    function getBrokerage(address currency) external view returns (int256);

    function getCurrencies() external view returns (address[] memory);
}

contract NFTCollection is ERC721A, ERC2981, Ownable {
    uint256 public maxSupply; //Set the maximum supply
    string baseURI; //Set the Base URI
    string baseURISuffix = ".json"; //Set the base URI Suffix
    string contractURI; //Set the contract URI
    uint96 royalty; //Set the Royalty
    uint256 public whitelistedFee; //Set the whitelisted Fee
    uint256 public mintFee; //Set the mint Fee
    uint256 public maxQuantity; //Set the maximum quantity
    address public creator; //address of Creator
    address platformPublicKey; //Address of Public key
    address brokerAddress; //Set the broker address
    address currency; // set the currency address
    mapping(uint256 => bool) public proceedNonce;
    uint256 public constant DECIMAL_PRECISION = 100; //Set the Decimal Precision

    //Structs
    struct UintArgs {
        uint256 maxSupply;
        uint256 whitelistedFee;
        uint256 mintFee;
        uint256 maxQuantity;
        uint96 royalty;
    }

    struct StringArgs {
        string name;
        string symbol;
        string baseURI;
        string contractURI;
    }

    constructor(
        UintArgs memory _uints,
        address _creator,
        StringArgs memory _strings,
        address _brokerAddress,
        address _platformPublicKey
    ) ERC721A(_strings.name, _strings.symbol) {
        maxSupply = _uints.maxSupply;
        whitelistedFee = _uints.whitelistedFee;
        mintFee = _uints.mintFee;
        maxQuantity = _uints.maxQuantity;
        royalty = _uints.royalty;
        creator = _creator;
        brokerAddress = _brokerAddress;
        platformPublicKey = _platformPublicKey;
        baseURI = _strings.baseURI;
        contractURI = _strings.contractURI;
        _setDefaultRoyalty(creator, _uints.royalty);
        _transferOwnership(creator);
    }

    /**
     *@dev Method to set whitelistedFee.
     *@notice This method will allow owner to set whitelistedFee.
     *@param _value whitelisted fee to be set in this method;
     */

    function setwhitelistedFee(uint256 _value) external onlyOwner {
        whitelistedFee = _value;
    }

    /**
     *@dev Method to set whitelistedFee.
     *@notice This method will allow owner to set mintFee.
     *@param _value mint Fee to be set in this method;
     */

    function setmintFee(uint256 _value) external onlyOwner {
        mintFee = _value;
    }

    /**
     *@dev Method to set maximum quantiity.
     *@notice This method will allow owner to set maxmimum quantity.
     *@param _value maxQuantity value be set in this method;
     */

    function setmaxQuantity(uint256 _value) external onlyOwner {
        maxQuantity = _value;
    }

    /**
    *@dev Method to generate signer.
    *@notice This method is used to provide signer.
    *@param hash: Name of hash is used to generate the signer.
    *@param _signature: Name of _signature is used to generate the signer.
    @return Signer address.
    */

    function getSigner(bytes32 hash, bytes memory _signature)
        internal
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return
            ecrecover(
                keccak256(
                    abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
                ),
                v,
                r,
                s
            );
    }

    function _getBrokrage(address currency, address launchpad)
        internal
        view
        returns (int256)
    {
        INFTLaunchPad instance = INFTLaunchPad(launchpad);
        return instance.getBrokerage(currency);
    }

    function _getCurrencies(address launchpad)
        internal
        view
        returns (address[] memory)
    {
        INFTLaunchPad instance = INFTLaunchPad(launchpad);
        return instance.getCurrencies();
    }

    /**
     *@dev Method to verify WhiteList user.
     *@notice This method is used to verify whitelist user.
     *@param whitelistUser: Address of whitelistUser.
     *@param nonce: nonce to be generated while minting.
     *@param mintTime: Time required to mint the NFT.
     *@param _isWhiteListed: User is whitelisted or not.
     *@param _signature: _signature is used to generate the signer.
     *@param _amount: calculated.
     *@param _quantity: NFT quantity to be minted.
     *@return bool value if user is verified.
     */

    function verifyWhiteListUser(
        address whitelistUser,
        uint256 nonce,
        uint256 mintTime,
        bool _isWhiteListed,
        bytes memory _signature,
        uint256 _amount,
        uint256 _quantity
    ) internal returns (bool) {
        bytes32 hash = keccak256(
            abi.encodePacked(whitelistUser, nonce, mintTime, _isWhiteListed)
        );
        address verifiedUser = getSigner(hash, _signature);

        require(
            _amount >= whitelistedFee * _quantity,
            "NFTCollection: Mint amount is insufficient."
        );

        if (verifiedUser == platformPublicKey && _isWhiteListed) {
            _mint(msg.sender, _quantity);
            return _isWhiteListed;
        } else {
            return _isWhiteListed;
        }
    }

    /**
     *@dev Method to split the signature.
     *@param sig: Name of _signature is used to generate the signer.
     */
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "NFTCollection: invalid signature length.");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function _currencyExists(address _currency, address launchpad)
        internal
        view
        returns (bool)
    {
        INFTLaunchPad instance = INFTLaunchPad(launchpad);
        address[] memory currencies = instance.getCurrencies();
        for (uint256 i = 0; i < currencies.length; i++) {
            if (currencies[i] == _currency) {
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     *@dev Method to mint the NFT.
     *@notice This method is used to mint the NFT.
     *@param _quantity: NFT quantity to be minted.
     *@param nonce: nonce to be generated while minting.
     *@param mintTime: Time required to mint the NFT.
     *@param _signature: _signature is used to generate the signer.
     *@param isWhiteListed: User is whitelisted or not.
     *@param _currency: Which currency to be used to mint.
     */
    function mint(
        uint256 _quantity,
        uint256 nonce,
        uint256 mintTime,
        bytes calldata _signature,
        bool isWhiteListed,
        address _currency,
        address _launchpad
    ) external payable {
        require(
            _currencyExists(_currency, _launchpad) == true,
            "NFTCollection: Currency doesn't exist"
        );

        require(
            totalSupply() + _quantity <= maxSupply,
            "NFTCollection: Max supply must be greater!"
        );
        require(!proceedNonce[nonce], "NFTCollection: Nonce already proceed!");
        require(
            block.timestamp > mintTime,
            "NFTCollection: Mint time should be less than current time"
        );
        require(
            maxQuantity <= _quantity,
            "NFTCollection: Max quantity reached"
        );
        isWhiteListed = verifyWhiteListUser(
            msg.sender,
            nonce,
            mintTime,
            isWhiteListed,
            _signature,
            msg.value,
            _quantity
        );
        if (!isWhiteListed) {
            require(
                msg.value >= mintFee * _quantity,
                "NFTCollection: Mint amount is insufficient."
            );
            _mint(msg.sender, _quantity);
        }
        proceedNonce[nonce] = true;
        int256 brokerage = _getBrokrage(_currency, _launchpad);

        if (brokerage > 0 && _currency == address(0)) {
            uint256 brokerageAmount = (msg.value * uint256(brokerage)) /
                (100 * DECIMAL_PRECISION);
            payable(brokerAddress).transfer(brokerageAmount);
        }
    }

    /**
     *@dev Method to mint by only owner.
     *@notice This method will allow owner to mint.
     *@param _quantity: NFT quantity to be minted.
     */

    function mintByOwner(uint256 _quantity) external onlyOwner {
        require(
            totalSupply() + _quantity <= maxSupply,
            "NFTCollection: Max supply must be greater!"
        );
        _mint(msg.sender, _quantity);
    }

    /**
     *@dev Method to update public key.
     *@notice This method will used to update public key.
     *@param publicKey: Address of public key.
     *@param launchpadAddress: Address of launchpad contract.
     */

    function updatePublicKey(address publicKey, address launchpadAddress)
        external
    {
        require(
            msg.sender == launchpadAddress,
            "NFTCollection: Only NFTLaunchPad contract update public key"
        );
        platformPublicKey = publicKey;
    }

    /**
     *@dev Method to withdraw ERC20 token.
     *@notice This method is used to withdraw ERC20 token.
     *@param _erc20Token: address of ERC20Token.
     */
    function withdrawERC20Token(address _erc20Token, address _reciver)
        external
        onlyOwner
    {
        IERC20 objectERC20 = IERC20(_erc20Token);
        objectERC20.transfer(_reciver, objectERC20.balanceOf(address(this)));
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function _baseURISuffix() internal view virtual returns (string memory) {
        return baseURISuffix;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        public
        view
        virtual
        override
        returns (address, uint256)
    {
        require(
            ownerOf(_tokenId) != address(0),
            "NFTCollection: Token does not exists!"
        );

        uint256 royaltyAmount = (_salePrice * royalty) / _feeDenominator();

        return (creator, royaltyAmount);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        return
            bytes(baseURI).length != 0
                ? string(
                    abi.encodePacked(baseURI, _toString(tokenId), baseURISuffix)
                )
                : "";
    }

    function contractsURI() public view returns (string memory) {
        return
            bytes(contractURI).length != 0
                ? string(abi.encodePacked(contractURI, baseURISuffix))
                : "";
    }
}
