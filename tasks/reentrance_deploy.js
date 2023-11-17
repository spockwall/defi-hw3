const fs = require("fs");
async function deploy(walletAddress, hre) {
    const studentWalletAddress = walletAddress;
    const greeter = await hre.ethers.deployContract("Reentrance", [studentWalletAddress], { value: 1000000000000000 });
    const contract = await greeter.waitForDeployment();
    console.log("Reentrance is deployed on network: sepolia at address:", await contract.getAddress());
    result = { walletAddress: walletAddress, contractAddress: [await contract.getAddress()], challenge: "reentrance" };
    fs.appendFileSync("./address/reentrance.txt", JSON.stringify(result) + "\n");
}

task("reentrance_deploy", "Deploys the Greeter contract with student wallet")
    .addPositionalParam("walletAddress", "The student wallet address")
    .setAction(async (taskArgs, hre) => {
        console.log("taskArgs", taskArgs);
        await hre.run("compile");
        await deploy(taskArgs.walletAddress, hre).catch(async (error) => {
            console.error(error);
            process.exitCode = 1;
        });
    });
