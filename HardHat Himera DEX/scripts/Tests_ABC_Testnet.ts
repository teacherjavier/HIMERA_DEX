import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from 'fs';
//import { promises as fsPromises } from 'fs';
import path from 'path';

dotenv.config();

// Function to create and save wallets
// async function createAndSaveWallets() {
//   try {
//     // Create an array to store wallets
//     const wallets = [];

//     // Create 4 new wallets
//     for (let i = 0; i < 4; i++) {
//       const wallet = ethers.Wallet.createRandom();
//       wallets.push({
//         address: wallet.address,
//         privateKey: wallet.privateKey
//       });
//     }

//     // Define the path to save the wallets
//     const storagePath = path.join(__dirname, 'persistent_wallets.json');

//     // Save wallets to the file
//     fs.writeFileSync(storagePath, JSON.stringify(wallets, null, 2));

//     console.log(`Successfully created and saved ${wallets.length} wallets to ${storagePath}`);

//     // Optionally, display the wallets
//     wallets.forEach((wallet, index) => {
//       console.log(`Wallet ${index + 1}:`);
//       console.log(`Address: ${wallet.address}`);
//       console.log(`Private Key: ${wallet.privateKey}`);
//       console.log("------------------------");
//     });

//   } catch (error) {
//     console.error("Error creating or saving wallets:", error);
//   }
// }



// Función para obtener el precio actual del gas
async function getCurrentGasPrice(provider: { getGasPrice: () => any; }) {
  const gasPrice = await provider.getGasPrice();
  console.log(`Precio actual del gas: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);
  return gasPrice;
}

async function main() {
  // 1. Lee variables de entorno
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY_DEV!;
  const chainId = process.env.CHAIN_ID;
  const CRASH_Address=process.env.CRASH;
  const Sale_Address=process.env.SALE;
  const BURN_Address=process.env.BURN;
  const Farm_Address=process.env.FARM;
  const Pool1_Address=process.env.POOL1;
  const Pool2_Address=process.env.POOL2;
  const LP1_Address=process.env.LP1;
  const LP2_Address=process.env.LP2;


  
  // 2. Crea el proveedor de tu testnet
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, {
    chainId: Number(chainId),
    name: "ABC Testnet"
  });

  // 3. Create and save wallets
  //await createAndSaveWallets();

  // 3. Crea un wallet con tu clave privada y asócialo al provider
  const wallet = new ethers.Wallet(privateKey, provider);

  // 4. Imprime algo de info
  console.log("Usando RPC:", rpcUrl);
  console.log("Chain ID:", chainId);
  console.log("Cuenta:", wallet.address);

  // 5. Lógica adicional...
  const balance = await wallet.getBalance();
  console.log("Balance de la cuenta:", ethers.utils.formatEther(balance), "TEST Tokens");

  const gasPrice = await getCurrentGasPrice(provider);
  const maxFeePerGas = gasPrice.mul(ethers.BigNumber.from(110)).div(ethers.BigNumber.from(100));
  console.log(`maxFeePerGas calculado: ${ethers.utils.formatUnits(maxFeePerGas, "gwei")} Gwei`);

  const Sale = new ethers.Contract(Sale_Address!, require('../artifacts/contracts/Sale.sol/Sale.json').abi, wallet);

  // 4. Optionally, you can load existing wallets from the file
  const loadExistingWallets = async () => {
    try {
        const storagePath = path.join(__dirname, 'persistent_wallets.json');
        const walletsData = fs.readFileSync(storagePath, 'utf8');
        const wallets: Array<{ address: string; privateKey: string }> = JSON.parse(walletsData);
        
        // Convert the private keys back into wallet objects and connect to provider
        const loadedWallets = wallets.map(walletData => {
          return new ethers.Wallet(walletData.privateKey, provider);
        });

        console.log("Loaded wallets:");
        for (const [index, wallet] of loadedWallets.entries()) {
          const balance = await wallet.getBalance();
          console.log(`Wallet ${index + 1}:`);
          console.log(`Address: ${wallet.address}`);
          console.log(`Balance: ${ethers.utils.formatEther(balance)} TEST Tokens`);
          if ((index + 1) == 1) {

            //const recipientAddress = "0x6C9585B10126C147DCBE7c7CfA816E9C5feDaDd0"; // Replace with the recipient's address
            //const amountToSend = ethers.utils.parseEther("9.9"); // Transfer 1 native token

            // //Check if balance is sufficient
            // if (balance.lt(amountToSend)) {
            //   throw new Error("Insufficient balance");
            // }

            // //Create transaction
            // const tx = {
            //   from: wallet.address,
            //   to: recipientAddress,
            //   value: amountToSend,
            //   gasLimit: 21000,
            //   maxFeePerGas: maxFeePerGas,
            //   maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"), // Optional but recommended
            //   type: 2, // EIP-1559 transaction type
            // };

            // // Send transaction
            // const transaction = await wallet.sendTransaction(tx);
            // console.log("Transaction sent. Hash:", transaction.hash);

            // // Wait for transaction confirmation
            // const receipt = await transaction.wait();
            // console.log("Transaction confirmed:", receipt.transactionHash);
            // console.log("Gas used:", receipt.gasUsed.toString());

            // 5. Comprar tokens
            console.log("Comprando tokens...");
            // Cuenta 1
            let tx = await Sale.connect(wallet).buyCRASH(ethers.utils.parseUnits("20"));
            await tx.wait();
            tx = await Sale.connect(wallet).buyBURN(ethers.utils.parseUnits("10"));
            await tx.wait();

          } else if ((index + 1) == 2) {
            // Cuenta 2
            let tx = await Sale.connect(wallet).buyCRASH(ethers.utils.parseUnits("10"));
            await tx.wait();
            tx = await Sale.connect(wallet).buyBURN(ethers.utils.parseUnits("50"));
            await tx.wait();

          } else if ((index + 1) == 3) {
            // Cuenta 3
            let tx = await Sale.connect(wallet).buyCRASH(ethers.utils.parseUnits("1"));
            await tx.wait();

          } else {
            // Cuenta 4
            let tx = await Sale.connect(wallet).buyBURN(ethers.utils.parseUnits("1"));
            await tx.wait();

          }



          console.log("------------------------");
        }
      } catch (error) {
        console.error("Error loading wallets:", error);
      }
    };
  

    // If you want to use an existing wallet, uncomment this
    await loadExistingWallets();




    
  // 6. Transfer funds to another wallet
  try {
    //const recipientAddress = "0xDbFACDe428CF4027f1CC51F3408B130f354684c1"; // Replace with the recipient's address
    //const amountToSend = ethers.utils.parseEther("1"); // Transfer 1 native token

    // Check if balance is sufficient
    //if (balance.lt(amountToSend)) {
    //  throw new Error("Insufficient balance");
    //}

    // Create transaction
    //const tx = {
    //  from: wallet.address,
    //  to: recipientAddress,
    //  value: amountToSend,
    //  gasLimit: 21000,
    //  maxFeePerGas: maxFeePerGas,
    //  maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"), // Optional but recommended
    //  type: 2, // EIP-1559 transaction type
    //};

    //await owner.sendTransaction({
    //  to: farm.address,
    //  value: ethers.utils.parseEther("10.0") // Envía 10 ETH/MATIC
    //});

    // Send transaction
    //const transaction = await wallet.sendTransaction(tx);
    //console.log("Transaction sent. Hash:", transaction.hash);

    // Wait for transaction confirmation
    //const receipt = await transaction.wait();
    //console.log("Transaction confirmed:", receipt.transactionHash);
    //console.log("Gas used:", receipt.gasUsed.toString());

    // Get new balance after transfer
    //const newBalance = await wallet.getBalance();
    //console.log("New balance:", ethers.utils.formatEther(newBalance), "native tokens");

    // const CRASH = new ethers.Contract(CRASH_Address!, require('../artifacts/contracts/CRASH_v2.sol/CRASH.json').abi, wallet);
    // const BURN = new ethers.Contract(BURN_Address!, require('../artifacts/contracts/BURN_v2.sol/BURN.json').abi, wallet);
    //const Sale = new ethers.Contract(Sale_Address!, require('../artifacts/contracts/Sale.sol/Sale.json').abi, ownerWallet);

    // const Farm = new ethers.Contract(addresses.Farm, require('../artifacts/contracts/Farm.sol/Farm.json').abi, ownerWallet);
    // const Pool1 = new ethers.Contract(addresses.Pool1, require('../artifacts/contracts/Pool1_v2.sol/Pool1.json').abi, ownerWallet);
    // const Pool2 = new ethers.Contract(addresses.Pool2, require('../artifacts/contracts/Pool2_v2.sol/Pool2.json').abi, ownerWallet);
    // const LP1_token = new ethers.Contract(addresses.LP1Token, require('../artifacts/contracts/LP1_token.sol/LP1_token.json').abi, ownerWallet);
    // const LP2_token = new ethers.Contract(addresses.LP2Token, require('../artifacts/contracts/LP2_token.sol/LP2_token.json').abi, ownerWallet);

    //let tx = await BURN.connect(wallet).transfer(Sale_Address, ethers.utils.parseUnits("20000"));
    //await tx.wait();
    //let tx = await CRASH.connect(wallet).approve(Sale_Address, ethers.utils.parseUnits("20000"));
    //await tx.wait();
    //tx = await BURN.connect(wallet).approve(Sale_Address, ethers.utils.parseUnits("20000"));
    //await tx.wait();



  } catch (error) {
    console.error("Error transferring funds:", error);

    // Añade estas importaciones al principio del archivo
  }

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
