const fs = require("fs");
async function deploy(walletAddress, hre) {
    const studentWalletAddress = walletAddress;
    const greeter = await hre.ethers.deployContract("Greeter", [studentWalletAddress]);
    const contract = await greeter.waitForDeployment(2);
    console.log("Greeter is deployed on network: sepolia at address:", await contract.getAddress());
    result = { walletAddress: walletAddress, contractAddress: [await contract.getAddress()], challenge: "greeter" };
    fs.appendFileSync("./address/greeter.txt", JSON.stringify(result) + "\n");
}

task("greeter_deploy", "Deploys the Greeter contract with student wallet")
    .addPositionalParam("walletAddress", "The student wallet address")
    .setAction(async (taskArgs, hre) => {
        await hre.run("compile");
        await deploy(taskArgs.walletAddress, hre).catch(async (error) => {
            console.error(error);
            process.exitCode = 1;
        });
    });
