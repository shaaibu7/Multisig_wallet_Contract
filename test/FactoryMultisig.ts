import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
  
  describe("MultisigFactory", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployToken() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
      const token = await erc20Token.deploy();
  
      return { token };
    }
  
    async function deployMultisigFactoryContract() {
      
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2, account3, account4] = await hre.ethers.getSigners();
  
      const { token } = await loadFixture(deployToken);
  
      const MultisigFactory = await hre.ethers.getContractFactory("MultisigFactory");
      const Multisig = await hre.ethers.getContractFactory("Multisig");
      const multisigFactory = await MultisigFactory.deploy();
      const contractAddress = multisigFactory.getAddress();
  
      return { multisigFactory, Multisig, owner, account1, account2, account3, account4, token, contractAddress };
    }
  
    describe("Test factory contract deployment", function () {
      it("Should return correct number od deployed contract", async function () {
        const { multisigFactory, owner, account1, account2, account3, account4 } = await loadFixture(deployMultisigFactoryContract);
        const quorum = 3;

        const createMultiSigWallet = await multisigFactory.createMultisigWallet(quorum, [account1, account2, account3]);
        const getDeployedMultisig = await multisigFactory.getMultiSigClones();

        expect(await getDeployedMultisig.length).to.eq(1);
      });
  

      it("Should interact with deployed smart contract", async function () {
        const { multisigFactory, owner, account1, account2, account3, account4 } = await loadFixture(deployMultisigFactoryContract);
        const quorum = 3;

        const createMultiSigWallet = await multisigFactory.createMultisigWallet(quorum, [account1, account2, account3]);
        const getDeployedMultisig = await multisigFactory.getMultiSigClones();
        const deployedMultisig = await getDeployedMultisig[0];

        const deployedContractInteract = await ethers.getContractAt("Multisig", deployedMultisig)

        expect(await deployedContractInteract.quorum()).to.be.eq(3);
        expect(await deployedContractInteract.noOfValidSigners()).to.be.greaterThan(1);
        expect(await deployedContractInteract.quorum()).to.be.lessThanOrEqual(await deployedContractInteract.noOfValidSigners());
        expect(await deployedContractInteract.noOfValidSigners()).to.eq(4);


      });
  
      
      
    });
  
    
    
        
  });
  