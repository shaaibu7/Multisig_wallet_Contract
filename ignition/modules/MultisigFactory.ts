import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultisigFactoryModule = buildModule("MultisigFactoryModule", (m) => {
  

  const multisigFactory = m.contract("MultisigFactory");

  return { multisigFactory };
});

export default MultisigFactoryModule;


// deployed
// 0xe1A722603fe84fb84510Aa936d7fAe3B831784F9