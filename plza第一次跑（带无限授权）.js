const ethers = require('ethers');
const fs = require('fs'); // 引入fs模块

const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");

// 私钥和钱包的设置
const privateKeys = [
'0x5000000000000000000000000000000000000000000000000000000000000000',
'0x47382c85000000000000000000000000000000000000e12e000000000000002f',

    // ...添加其他私钥
];


let currentKeyIndex = 0;

function getNextPrivateKey() {
    if (currentKeyIndex >= privateKeys.length) {
        return null; 
    }

    const chosenKey = privateKeys[currentKeyIndex];
    currentKeyIndex++; 

    return chosenKey;
}


const contractAddress = '0x47129e886b44B5b8815e6471FCD7b31515d83242'; 
const contractABI = [

    {
        "inputs": [
            { "internalType": "enum Pool.TokenType", "name": "tokenType", "type": "uint8" },
            { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "minAmount", "type": "uint256" }
        ],
        "name": "create",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },

    {
        "inputs": [
            { "internalType": "enum Pool.TokenType", "name": "tokenType", "type": "uint8" },
            { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
            { "internalType": "uint256", "name": "minAmount", "type": "uint256" }
        ],
        "name": "redeem",
        "outputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }

];


const tasks = [
    // 授权1
    {
        type: 'transaction',
        taskNumber: 1,
        contractAddress: '0x13e5FB0B6534BB22cBC59Fae339dbBE0Dc906871',
        data: '0x095ea7b300000000000000000000000047129e886b44b5b8815e6471fcd7b31515d83242000000000000000000000000000000000000000000000000016345785d8a0000'
    },
    // 任务2 - 调用 create 函数（不带 deadline 和 onBehalfOf）
    {
        type: 'function',
        taskNumber: 2,
        operation: 'create',
        tokenType: 0, // 替换为实际的 TokenType 枚举值
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改数量
        minAmount: ethers.constants.Zero // 0
    },
    // 任务3
    {
        type: 'transaction',
        taskNumber: 3,
        contractAddress: '0x13e5FB0B6534BB22cBC59Fae339dbBE0Dc906871',
        data: '0x095ea7b300000000000000000000000047129e886b44b5b8815e6471fcd7b31515d83242000000000000000000000000000000000000007e37be2022c0914b2680000000'
    },
    // 任务4 - 调用 create 函数（不带 deadline 和 onBehalfOf）
    {
        type: 'function',
        taskNumber: 4,
        operation: 'create',
        tokenType: 1, // 替换为实际的 TokenType 枚举值
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改数量
        minAmount: ethers.constants.Zero // 0
    },
    // 任务5
    {
        type: 'transaction',
        taskNumber: 5,
        contractAddress: '0x1aC493C87a483518642f320Ba5b342c7b78154ED',
        data: '0x095ea7b3000000000000000000000000809dabc75201f92ac40973f22db37995676baa040000000000000000000000000000000000000000000000001bc16d674ec80000'
    },
    // 任务6 - 调用 redeem 函数（不带 deadline 和 onBehalfOf）
    {
        type: 'function',
        taskNumber: 6,
        operation: 'redeem',
        tokenType: 0, // 替换为实际的 TokenType 枚举值
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改数量
        minAmount: ethers.constants.Zero // 0
    },
    // 任务7
    {
        type: 'transaction',
        taskNumber: 7,
        contractAddress: '0x975f67319f9DA83B403309108d4a8f84031538A6',
        data: '0x095ea7b3000000000000000000000000809dabc75201f92ac40973f22db37995676baa0400000000000000000000000000000000000000000000000002c68af0bb140000'
    },
    // 任务8 - 调用 redeem 函数（不带 deadline 和 onBehalfOf）
    {
        type: 'function',
        taskNumber: 8,
        operation: 'redeem',
        tokenType: 1, // 替换为实际的 TokenType 枚举值
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改数量
        minAmount: ethers.constants.Zero // 0
    }
    // 可以根据需要添加更多任务
];

// 生成随机的Gas价格
function getRandomGasPrice() {
    // 基础Gas价格为1.5 GWEI
    const baseGasPrice = ethers.utils.parseUnits('1.5', 'gwei'); // 1.5 GWEI

    // 随机增加0.00001到0.00100 GWEI
    const minAddition = ethers.BigNumber.from('10000'); 
    const maxAddition = ethers.BigNumber.from('1000000'); 


    const randomAddition = ethers.BigNumber.from(
        Math.floor(Math.random() * (maxAddition.toNumber() - minAddition.toNumber())) + minAddition.toNumber()
    );


    return baseGasPrice.add(randomAddition);
}

// 发送指定交易数据的函数
async function sendTransactionTask(wallet, task) {
    const tx = {
        to: task.contractAddress,
        value: ethers.constants.Zero, // value设为0
        data: task.data,
        gasPrice: getRandomGasPrice(),

    };

    try {
        console.log(`正在执行任务${task.taskNumber}: 向合约 ${task.contractAddress} 发送交易`);
        const response = await wallet.sendTransaction(tx);
        console.log(`任务${task.taskNumber}的交易哈希: ${response.hash}`);

        await response.wait();
        console.log(`任务${task.taskNumber}的交易已确认。\n`);
    } catch (error) {
        // 将错误的私钥写入error.txt文件
        fs.appendFileSync('mission_error.txt', `${wallet.privateKey}\n`); // 错误文件
        console.error(`任务${task.taskNumber}执行失败，地址 ${wallet.address}: ${error.message}\n`);
    }
}

// 发送指定操作的函数（不带 deadline 和 onBehalfOf）
async function sendFunctionTask(wallet, task) {
    // 创建合约实例
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    try {
        if (task.operation === 'create') {
            console.log(`正在执行任务${task.taskNumber}: 创建操作`);

            const tx = await contract.create(
                task.tokenType,
                task.depositAmount,
                task.minAmount,
                {
                    gasPrice: getRandomGasPrice()
                }
            );
            console.log(`任务${task.taskNumber}的创建交易哈希: ${tx.hash}`);

            await tx.wait();
            console.log(`任务${task.taskNumber}的创建交易已确认。\n`);
        } else if (task.operation === 'redeem') {
            console.log(`正在执行任务${task.taskNumber}: 赎回操作`);

            const tx = await contract.redeem(
                task.tokenType,
                task.depositAmount,
                task.minAmount,
                {
                    gasPrice: getRandomGasPrice()
                }
            );
            console.log(`任务${task.taskNumber}的赎回交易哈希: ${tx.hash}`);

            await tx.wait();
            console.log(`任务${task.taskNumber}的赎回交易已确认。\n`);
        } else {
            console.log(`任务${task.taskNumber}: 未知的操作类型 ${task.operation}`);
        }
    } catch (error) {
        // 将错误的私钥写入error.txt文件
        fs.appendFileSync('mossion_error.txt', `${wallet.privateKey}\n`); // 错误文件
        console.error(`任务${task.taskNumber}执行失败，地址 ${wallet.address}: ${error.message}\n`);
    }
}

// 处理每个钱包的所有任务
async function processForWallet(wallet) {
    for (const task of tasks) {
        if (task.type === 'transaction') {
            await sendTransactionTask(wallet, task);
        } else if (task.type === 'function') {
            await sendFunctionTask(wallet, task);
        } else {
            console.log(`未知的任务类型: ${task.type}`);
        }
    }
}

// 主流程
async function main() {
    let privateKey = getNextPrivateKey();

    while (privateKey) {
        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(`开始处理钱包地址: ${wallet.address}\n`);

        await processForWallet(wallet);

        privateKey = getNextPrivateKey();
    }

    console.log("所有交易已完成！");
}

main().catch((error) => {
    console.error("主流程中发生错误:", error);
});
