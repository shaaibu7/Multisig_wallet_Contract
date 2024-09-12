import { ethers } from "hardhat";

async function main() {
    const web3CXITokenAddress = "0xA64d3C683F89d3D603649AB6a92723899527B53B";
    const web3CXI = await ethers.getContractAt("Web3CXI", web3CXITokenAddress);

    const multisigFactoryContractAddress = "0xe1A722603fe84fb84510Aa936d7fAe3B831784F9";
    const multisigFactory = await ethers.getContractAt("MultisigFactory", multisigFactoryContractAddress)

    // Deploying multisigWallet using factory

    const quorum = 3;
    // const [ owner, account1, account2, account3 ] = await ethers.getSigners();
    const signer1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const signer2 = "0xE859ac304020Dd3039082827d2Cbd25979297BDD";
    const signer3 = "0x759CFE087931e6479Cb252Ae62a10Ea30D1d0A39";


    const createMultiSigWallet = await multisigFactory.createMultisigWallet(
        quorum,
        [
            signer1, 
            signer2,
            signer3,
        ]
    )

    createMultiSigWallet.wait();

    const getDeployedMultisigWallets = await multisigFactory.getMultiSigClones();
    console.log("Deployed contracts::::", getDeployedMultisigWallets);


    // Interacting with deployed multisigwallet

    // const getdeployedMultisigWallet = getDeployedMultisigWallets[0];
    // const multisigWalletContract = await ethers.getContractAt("MultisigWalletContract", getdeployedMultisigWallet)

    
    // const amount = ethers.parseUnits("100", 18);
    // multisigWalletContract.transfer()




}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
