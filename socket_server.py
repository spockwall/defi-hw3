#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import socket
import threading
import re
import os
import time
import json

HOST = "0.0.0.0"
PORT = 3001
challenges = ["Greeter", "Gate", "Delegation", "Reentrance"]


def error_handler(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(e)
            return None

    return wrapper


def recv_from_client(client_fd: socket, size: int) -> str:
    indata = client_fd.recv(size)
    return indata.decode()


def send_to_client(client_fd: int, data: str) -> None:
    client_fd.send(data.encode())


@error_handler
def receive_wallet_address(client_fd: socket, buffer_size: int) -> str | None:
    send_to_client(client_fd, "- Input your MetaMask wallet address (0x....): ")
    wallet_address = recv_from_client(client_fd, buffer_size).strip()
    is_valid = re.match(r"^0x[a-fA-F0-9]{40}$", wallet_address) is not None
    return wallet_address if is_valid else None


@error_handler
def receive_challenge_selection(client_fd: socket, buffer_size: int) -> str | None:
    serialized = [f"[{i}]: {challenge}" for i, challenge in enumerate(challenges)]
    send_to_client(client_fd, "- Challenges are as follows:\n")
    send_to_client(client_fd, "\n".join(serialized) + "\n")
    send_to_client(client_fd, "- Choose a challenge (number only): ")
    serial = recv_from_client(client_fd, buffer_size).strip()
    is_valid = re.match(r"^[0-3]$", serial) is not None
    return serial if is_valid else None


@error_handler
def comfirm_deploy(
    client_fd: socket, wallet_address: str, serial: int, buffer_size: int
) -> str:
    send_to_client(client_fd, f"- MetaMask Wallet Address: {wallet_address}\n")
    send_to_client(client_fd, f"- Challenge: {challenges[serial]}\n")
    send_to_client(client_fd, "- Confirm to deploy? [Y/N]: ")
    confirm = recv_from_client(client_fd, buffer_size).strip()
    return confirm


@error_handler
def deploy_contract(
    clientfd: socket, wallet_address: str, serial: int
) -> list[str] | None:
    challenge = challenges[serial].lower()
    pid = os.fork()
    if pid == 0:
        deploy_cmd = (
            f"npx hardhat {challenge}_deploy {wallet_address} --network sepolia"
        )
        os.system(deploy_cmd)
        exit(0)
    for i in range(60):
        time.sleep(5)
        send_to_client(clientfd, "heartbeat~\n")
        with open(f"./address/{challenge}.txt", "r") as f:
            lines = f.readlines()
            infos = [json.loads(line) for line in lines]
            for info in infos:
                if (info["walletAddress"] == wallet_address) and (
                    info["challenge"] == challenge
                ):
                    return info["contractAddress"]
    send_to_client(clientfd, "Timeout! Please try again.\n")
    return None


@error_handler
def send_contract_address(client_fd: socket, contract_address: list[str]) -> None:
    def msg(name: str, contract_address: str) -> str:
        return f"Contract deployed! {name} Address: {contract_address}\n"

    if len(contract_address) > 1:
        contract_names = ["Delegation", "Delegate"]
        for i, contract_name in enumerate(contract_names):
            send_to_client(client_fd, msg(contract_name, contract_address[i]))
    else:
        send_to_client(client_fd, msg("", contract_address[0]))


def on_new_client(client_fd: socket, client_addr: tuple):
    print(f"new connection at {client_addr}")
    # receive wallet address
    wallet_address = receive_wallet_address(client_fd, 1024)
    print(f"wallet address: {wallet_address}")
    if wallet_address is None:
        send_to_client(client_fd, "Invalid wallet address! Socket closed.\n")
        client_fd.close()
        return

    # receive challenge selection
    serial = receive_challenge_selection(client_fd, 2048)
    if serial is None:
        send_to_client(client_fd, "Invalid selection! Socket closed.\n")
        client_fd.close()
        return
    # start to depoly
    if comfirm_deploy(client_fd, wallet_address, int(serial), 4096).lower() == "y":
        send_to_client(client_fd, "Challenge accepted! deploying contract...\n")
        contract_address = deploy_contract(client_fd, wallet_address, int(serial))
        if contract_address is not None:
            send_contract_address(client_fd, contract_address)
        else:
            send_to_client(client_fd, "Contract deployed failed! Please try again.\n")
    else:
        send_to_client(client_fd, "Challenge canceled! Socket closed.\n")
    client_fd.close()


def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen(5)

    print("server start at: %s:%s" % (HOST, PORT))

    while True:
        client_fd, client_addr = server.accept()
        thread = threading.Thread(target=on_new_client, args=(client_fd, client_addr))
        thread.start()


if __name__ == "__main__":
    main()
