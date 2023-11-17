const fs = require("fs");

async function deploy(walletAddress, hre) {
    const secret = "0x00000000000000000000000000000000000000007465737490aa7465737490aa";
    const gate = await hre.ethers.deployContract("Gate", [walletAddress, secret]);
    const contract = await gate.waitForDeployment();
    console.log("Gate deployed on network: sepolia at address:", await contract.getAddress());
    result = { walletAddress: walletAddress, contractAddress: [await contract.getAddress()], challenge: "gate" };
    fs.appendFileSync("./address/gate.txt", JSON.stringify(result) + "\n");
}

task("gate_deploy", "Deploys the Greeter contract with student wallet")
    .addPositionalParam("walletAddress", "The student wallet address")
    .setAction(async (taskArgs, hre) => {
        console.log("taskArgs", taskArgs);
        await hre.run("compile");
        await deploy(taskArgs.walletAddress, hre).catch(async (error) => {
            console.error(error);
            process.exitCode = 1;
        });
    });
