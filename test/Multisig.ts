import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("Multisig", function () {
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

  async function deployMultisigContract() {
    const quorum = 3;

    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4] = await hre.ethers.getSigners();

    const { token } = await loadFixture(deployToken);

    const Multisig = await hre.ethers.getContractFactory("Multisig");
    const multisig = await Multisig.deploy(quorum, [account1, account2, account3, account4]);
    const contractAddress = multisig.getAddress();

    return { multisig, quorum, owner, account1, account2, account3, account4, token, contractAddress };
  }

  describe("Test correct contract deployment on constructor function", function () {
    it("Should check that quorum is greater than 1", async function () {
      const { multisig, quorum, owner } = await loadFixture(deployMultisigContract);
      expect(await multisig.quorum()).to.be.greaterThan(1);
    });

    it("Should check that validsigners is greater than 1", async function () {
      const { multisig, quorum, owner } = await loadFixture(deployMultisigContract);
      expect(await multisig.noOfValidSigners()).to.be.greaterThan(1);
    });

    it("Should check that quorum is less than or equal to validsigners", async function () {
      const { multisig, quorum, owner } = await loadFixture(deployMultisigContract);
      expect(await multisig.quorum()).to.be.lessThanOrEqual(await multisig.noOfValidSigners());
    });


    it("Should check the number of quorum", async function () {
      const { multisig, quorum, owner } = await loadFixture(deployMultisigContract);
      expect(await multisig.quorum()).to.eq(quorum);
    });

    it("Should check the number of valid signers", async function () {
      const { multisig, quorum, owner } = await loadFixture(deployMultisigContract);
      expect(await multisig.noOfValidSigners()).to.eq(5);
    });

    it("Should check the number of valid signers", async function () {
      const { multisig, quorum, owner } = await loadFixture(deployMultisigContract);
      expect(await multisig.noOfValidSigners()).to.eq(5);
    });

    it("Should check if a signer is valid", async function () {
      const { multisig, quorum, owner, account1 } = await loadFixture(deployMultisigContract);
      expect(await multisig.getValidSigner(account1)).to.be.eq(true);
      expect(await multisig.getValidSigner(owner)).to.be.eq(true);
    });

    
  });

  describe("Testing the transfer function", function() {
    it("Should check that correct token was sent from token contract to multisig contract", async function () {
      const { multisig, quorum, owner, account1, token, contractAddress } = await loadFixture(deployMultisigContract);
      const amount = ethers.parseUnits("1", 18);
      const tokenTransfer = ethers.parseUnits("10000", 18)

      await token.transfer(contractAddress, tokenTransfer);
      await multisig.transfer(amount, account1, token)

      expect(await token.balanceOf(contractAddress)).to.eq(tokenTransfer);
    });

    it("Should check that transfer transaction is initiated in multisig", async function () {
      const { multisig, quorum, owner, account1, token, contractAddress } = await loadFixture(deployMultisigContract);
      const amount = ethers.parseUnits("1", 18);
      const tokenTransfer = ethers.parseUnits("10000", 18)

      await token.transfer(contractAddress, tokenTransfer);
      const transferTx = await multisig.transfer(amount, account1, token)
      const tx = await multisig.getTransaction(1);


      expect(await tx.id).to.eq(1);
      expect(await tx.amount).to.eq(amount);
      expect(await tx.recipient).to.eq(account1);
      expect(await tx.sender).to.eq(owner);
    });

  })

  
      
});
