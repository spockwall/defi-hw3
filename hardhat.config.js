require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("./tasks/greeter_deploy");
require("./tasks/gate_deploy");
require("./tasks/delegation_deploy");
require("./tasks/reentrance_deploy");

const homework_key = process.env.PRIVATE_KEY;
module.exports = {
    defaultNetwork: "sepolia",
    networks: {
        hardhat: {},
        localhost: {
            url: "http://localhost:8545",
        },
        sepolia: {
            url: "https://eth-sepolia.public.blastapi.io",
            accounts: [homework_key],
        },
        goerli: {
            url: "https://rpc.ankr.com/eth_goerli",
            accounts: [homework_key],
        },
    },
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    paths: {
        sources: "./challenges",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    mocha: {
        timeout: 40000,
    },
};
