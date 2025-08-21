// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AcademicCredential
 * @dev Smart contract for storing and verifying academic credentials on blockchain
 * @dev Prevents fake university degrees by storing tamper-proof credential hashes
 */
contract AcademicCredential is Ownable {
    using Strings for uint256;

    // Struct to store credential information
    struct Credential {
        string studentName;
        string universityName;
        string degreeType;
        string fieldOfStudy;
        uint256 graduationDate;
        string credentialHash;
        bool isRevoked;
        uint256 issuedAt;
        address issuedBy;
    }

    // Mapping from credential hash to credential data
    mapping(bytes32 => Credential) public credentials;
    
    // Mapping to track if a credential hash exists
    mapping(bytes32 => bool) public credentialHashExists;
    
    // Mapping to track university authorities
    mapping(address => bool) public universityAuthorities;
    
    // Array to store all credential hashes for enumeration
    bytes32[] public allCredentialHashes;
    
    // Events
    event DegreeIssued(
        bytes32 indexed credentialHash,
        string studentName,
        string universityName,
        string degreeType,
        string fieldOfStudy,
        uint256 graduationDate,
        address indexed issuedBy,
        uint256 timestamp
    );
    
    event CredentialRevoked(
        bytes32 indexed credentialHash,
        address indexed revokedBy,
        uint256 timestamp
    );
    
    event UniversityAuthorityAdded(
        address indexed university,
        address indexed addedBy,
        uint256 timestamp
    );
    
    event UniversityAuthorityRemoved(
        address indexed university,
        address indexed removedBy,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyUniversityAuthority() {
        require(universityAuthorities[msg.sender], "Only university authorities can perform this action");
        _;
    }

    modifier credentialNotExists(bytes32 _credentialHash) {
        require(!credentialHashExists[_credentialHash], "Credential already exists");
        _;
    }

    modifier credentialExists(bytes32 _credentialHash) {
        require(credentialHashExists[_credentialHash], "Credential does not exist");
        _;
    }

    modifier credentialNotRevoked(bytes32 _credentialHash) {
        require(!credentials[_credentialHash].isRevoked, "Credential has been revoked");
        _;
    }

    constructor() Ownable(msg.sender) {
        // Contract deployer becomes the first university authority
        universityAuthorities[msg.sender] = true;
        emit UniversityAuthorityAdded(msg.sender, msg.sender, block.timestamp);
    }

    /**
     * @dev Issue a new academic credential
     * @param _studentName Name of the student
     * @param _universityName Name of the university
     * @param _degreeType Type of degree (e.g., Bachelor's, Master's, PhD)
     * @param _fieldOfStudy Field of study
     * @param _graduationDate Graduation date as timestamp
     * @param _credentialHash Keccak256 hash of the credential document
     */
    function issueCredential(
        string memory _studentName,
        string memory _universityName,
        string memory _degreeType,
        string memory _fieldOfStudy,
        uint256 _graduationDate,
        string memory _credentialHash
    ) external onlyUniversityAuthority credentialNotExists(keccak256(abi.encodePacked(_credentialHash))) {
        bytes32 credentialHash = keccak256(abi.encodePacked(_credentialHash));
        
        Credential memory newCredential = Credential({
            studentName: _studentName,
            universityName: _universityName,
            degreeType: _degreeType,
            fieldOfStudy: _fieldOfStudy,
            graduationDate: _graduationDate,
            credentialHash: _credentialHash,
            isRevoked: false,
            issuedAt: block.timestamp,
            issuedBy: msg.sender
        });
        
        credentials[credentialHash] = newCredential;
        credentialHashExists[credentialHash] = true;
        allCredentialHashes.push(credentialHash);
        
        emit DegreeIssued(
            credentialHash,
            _studentName,
            _universityName,
            _degreeType,
            _fieldOfStudy,
            _graduationDate,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Verify a credential by its hash
     * @param _credentialHash The credential hash to verify
     * @return isValid Whether the credential is valid
     * @return credential The credential data if valid
     */
    function verifyCredential(string memory _credentialHash) 
        external 
        view 
        returns (bool isValid, Credential memory credential) 
    {
        bytes32 credentialHash = keccak256(abi.encodePacked(_credentialHash));
        
        if (!credentialHashExists[credentialHash]) {
            return (false, Credential("", "", "", "", 0, "", true, 0, address(0)));
        }
        
        credential = credentials[credentialHash];
        isValid = !credential.isRevoked;
        
        return (isValid, credential);
    }

    /**
     * @dev Revoke a credential (only by the issuing university or contract owner)
     * @param _credentialHash The credential hash to revoke
     */
    function revokeCredential(string memory _credentialHash) 
        external 
        credentialExists(keccak256(abi.encodePacked(_credentialHash))) 
        credentialNotRevoked(keccak256(abi.encodePacked(_credentialHash)))
    {
        bytes32 credentialHash = keccak256(abi.encodePacked(_credentialHash));
        Credential storage credential = credentials[credentialHash];
        
        require(
            msg.sender == credential.issuedBy || msg.sender == owner(),
            "Only the issuing university or contract owner can revoke credentials"
        );
        
        credential.isRevoked = true;
        
        emit CredentialRevoked(credentialHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Add a new university authority
     * @param _university Address of the university to add
     */
    function addUniversityAuthority(address _university) external onlyOwner {
        require(_university != address(0), "Invalid university address");
        require(!universityAuthorities[_university], "University already has authority");
        
        universityAuthorities[_university] = true;
        emit UniversityAuthorityAdded(_university, msg.sender, block.timestamp);
    }

    /**
     * @dev Remove a university authority
     * @param _university Address of the university to remove
     */
    function removeUniversityAuthority(address _university) external onlyOwner {
        require(universityAuthorities[_university], "University does not have authority");
        
        universityAuthorities[_university] = false;
        emit UniversityAuthorityRemoved(_university, msg.sender, block.timestamp);
    }

    /**
     * @dev Get total number of credentials
     * @return Total count of credentials
     */
    function getTotalCredentials() external view returns (uint256) {
        return allCredentialHashes.length;
    }

    /**
     * @dev Get credential hash by index
     * @param _index Index of the credential
     * @return Credential hash at the specified index
     */
    function getCredentialHashByIndex(uint256 _index) external view returns (bytes32) {
        require(_index < allCredentialHashes.length, "Index out of bounds");
        return allCredentialHashes[_index];
    }

    /**
     * @dev Check if an address is a university authority
     * @param _address Address to check
     * @return Whether the address is a university authority
     */
    function isUniversityAuthority(address _address) external view returns (bool) {
        return universityAuthorities[_address];
    }
}
