const fs = require("fs");

async function delegate_deploy(hre) {
    const secret = "0x00000000000000000000000000000000000000007465737490aa7465737490aa";
    const delegate = await hre.ethers.deployContract("Delegate", [secret]);
    const contract = await delegate.waitForDeployment();
    console.log("Delegate deployed on network: sepolia at address:", await contract.getAddress());
    return await contract.getAddress();
}

async function delegation_deploy(walletAddress, delegate_address, hre) {
    const delegation = await hre.ethers.deployContract("Delegation", [walletAddress, delegate_address]);
    const contract = await delegation.waitForDeployment();
    console.log("Delegation deployed on network: sepolia at address:", await contract.getAddress());
    result = {
        walletAddress: walletAddress,
        contractAddress: [await contract.getAddress(), delegate_address],
        challenge: "delegation",
    };
    fs.appendFileSync("./address/delegation.txt", JSON.stringify(result) + "\n");
}

task("delegation_deploy", "Deploys the Greeter contract with student wallet")
    .addPositionalParam("walletAddress", "The student wallet address")
    .setAction(async (taskArgs, hre) => {
        console.log("taskArgs", taskArgs);
        await hre.run("compile");
        await delegate_deploy(hre)
            .then(async (address) => {
                await delegation_deploy(taskArgs.walletAddress, address, hre);
            })
            .catch(async (error) => {
                console.error(error);
                process.exitCode = 1;
            });
    });
