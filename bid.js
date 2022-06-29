const opensea = require("opensea-js");
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;
const MnemonicWalletSubprovider =
  require("@0x/subproviders").MnemonicWalletSubprovider;
const RPCSubprovider = require("web3-provider-engine/subproviders/rpc");
const Web3ProviderEngine = require("web3-provider-engine");

const MNEMONIC = "";
const INFURA_KEY = "";
const TARGET_CONTRACT_ADDRESS = "";
const MY_ADDRESS = "";
const NETWORK = "mainnet";
const STARTING_NFT_ID = "1";
const HOURS_OF_EXPIRATION = 24;
const ETH_PRICE = 0.01;
const API_KEY = "" || ""; // API key is optional but useful if you're doing a high volume of requests.

async function main(id) {
    let seaport;
  try {
    if (
      !MNEMONIC ||
      !INFURA_KEY ||
      !NETWORK ||
      !MY_ADDRESS ||
      !TARGET_CONTRACT_ADDRESS ||
      !STARTING_NFT_ID ||
      !HOURS_OF_EXPIRATION ||
      ! ETH_PRICE
    ) {
      console.error(
        "Please set a mnemonic, infura key, user address, network, and target NFT contract address."
      );
      return;
    }

    // Set up the wallet and provider stuff.
    const BASE_DERIVATION_PATH = `44'/60'/0'/0`;

    const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({
      mnemonic: MNEMONIC,
      baseDerivationPath: BASE_DERIVATION_PATH,
    });
    const infuraRpcSubprovider = new RPCSubprovider({
      rpcUrl: "https://" + NETWORK + ".infura.io/v3/" + INFURA_KEY,
    });

    const providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(mnemonicWalletSubprovider);
    providerEngine.addProvider(infuraRpcSubprovider);
    providerEngine.start();

    // Initialize the seaport.
    seaport = new OpenSeaPort(
      providerEngine,
      {
        networkName: NETWORK === "mainnet" ? Network.Main : Network.Rinkeby,
        apiKey: API_KEY,
      },
      (arg) => console.log(arg)
    );
  } catch (err) {
    console.log("FAILED AT TOP", err);
  }

  let tokenId = id ? id : STARTING_NFT_ID;

  // Make a bid on an item.
  console.log(
    `Bidding on https://opensea.io/assets/${TARGET_CONTRACT_ADDRESS}/${tokenId}`
  );
  try {
      while (tokenId) {
          const buyOrder = await seaport.createBuyOrder({
            asset: {
              tokenId,
              tokenAddress: TARGET_CONTRACT_ADDRESS,
            },
            startAmount: ETH_PRICE,
            accountAddress: MY_ADDRESS,
            expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * HOURS_OF_EXPIRATION) // One day from now
          });
          if (Number(tokenId) < 10000) {
              tokenId = `${Number(tokenId) + 1}`
          } else {
              tokenId = undefined;
          }
          console.log(
            `Successfully created a buy order! ${buyOrder.asset.openseaLink}\n`
          );
      }
  } catch (e) {
    console.log("Failed message:", e.message);
    setTimeout(async () => await main(`${Number(tokenId) + 1}`), 5000)
  }
}

main()
