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
      const transferTx = await multisig.connect(owner).transfer(amount, account1, token)
      const tx = await multisig.getTransaction(1);


      expect(await tx.id).to.eq(1);
      expect(await tx.amount).to.eq(amount);
      expect(await tx.recipient).to.eq(account1);
      expect(await tx.sender).to.eq(owner);
      expect(await tx.tokenAddress).to.eq(token);
      expect(await tx.noOfApproval).to.eq(1);
    });

    it("Should check that transfer transaction is initiated in multisig", async function () {
      const { multisig, quorum, owner, account1, token, contractAddress } = await loadFixture(deployMultisigContract);
      const amount = ethers.parseUnits("1", 18);
      const tokenTransfer = ethers.parseUnits("10000", 18)

      await token.transfer(contractAddress, tokenTransfer);
      const transferTx = await multisig.connect(owner).transfer(amount, account1, token)
      const tx = await multisig.getTransaction(1);
      const txId = tx.id;
      const hasSigned = multisig.checkIfAddressHasSigned(owner, txId);


      expect(await hasSigned).to.eq(true);
      
    });

  })

  describe("Test approve transaction functionality", function () {
    it("Should check that transfer transaction meet requirements for approval", async function () {
      const { multisig, quorum, owner, account1, token, contractAddress } = await loadFixture(deployMultisigContract);
      const amount = ethers.parseUnits("100", 18);
      const tokenTransfer = ethers.parseUnits("10000", 18)

      await token.transfer(contractAddress, tokenTransfer);
      const transferTx = await multisig.connect(owner).transfer(amount, account1, token)
      const tx = await multisig.getTransaction(1);
      const txId = tx.id;
      const hasSigned = multisig.checkIfAddressHasSigned(account1, txId);


      expect(await txId).to.not.eq(0);
      expect(await txId).to.be.eq(1)
      expect(await token.balanceOf(contractAddress)).to.be.greaterThanOrEqual(amount);
      expect(await tx.noOfApproval).to.be.lessThan(quorum);
      expect(await tx.noOfApproval).to.be.eq(1);
      expect(await multisig.getValidSigner(account1)).to.be.eq(true);
      expect(await hasSigned).to.be.eq(false);
      expect(await tx.isCompleted).to.be.eq(false);

      const approvalTx = await multisig.connect(account1).approveTx(1);
      const getTx = await multisig.getTransaction(1);
      const noOfApproval = getTx.noOfApproval;

      expect(await multisig.checkIfAddressHasSigned(account1, txId)).to.be.eq(true)
      expect(await noOfApproval).to.eq(2);
      
    });

    it("Check the approval of a transaction", async function () {
      const { multisig, quorum, owner, account1, account2, account3, token, contractAddress } = await loadFixture(deployMultisigContract);
      const amount = ethers.parseUnits("100", 18);
      const tokenTransfer = ethers.parseUnits("10000", 18)

      await token.transfer(contractAddress, tokenTransfer);
      const transferTx = await multisig.connect(owner).transfer(amount, account1, token)
      const tx = await multisig.getTransaction(1);
      const txId = tx.id;
      const hasSigned = multisig.checkIfAddressHasSigned(account1, txId);

      const approvalTx = await multisig.connect(account1).approveTx(1);
      const approvalTx1 = await multisig.connect(account2).approveTx(1);
      // const approvalTx2 = await multisig.connect(account3).approveTx(1);

      const getTx = await multisig.getTransaction(1);
      const noOfApproval = getTx.noOfApproval;

      expect(await noOfApproval).to.eq(3);
      expect(await getTx.isCompleted).to.eq(true);


    })

    it("Should revert if transaction approval exceeds no of approval", async function () {
      const { multisig, quorum, owner, account1, account2, account3, token, contractAddress } = await loadFixture(deployMultisigContract);
      const amount = ethers.parseUnits("100", 18);
      const tokenTransfer = ethers.parseUnits("10000", 18)

      await token.transfer(contractAddress, tokenTransfer);
      const transferTx = await multisig.connect(owner).transfer(amount, account1, token)
      const tx = await multisig.getTransaction(1);
      const txId = tx.id;
      const hasSigned = multisig.checkIfAddressHasSigned(account1, txId);

      const approvalTx = await multisig.connect(account1).approveTx(1);
      const approvalTx1 = await multisig.connect(account2).approveTx(1);

       
      expect(multisig.connect(account3).approveTx(1)).to.be.revertedWith('transaction already completed');


    })


  })

  
      
});
