const ethers = require('ethers');
const fs = require('fs'); // 引入fs模块

// 连接到以太坊网络（请确保URL正确，这里使用Sepolia测试网作为示例）
const provider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org");

// 私钥和钱包的设置（确保私钥有权限调用相关函数）
const privateKeys = [
    '3770000000000000000000000000000000000000000000000000000000000000',
    '3770000000000000000000000000000000000000000000000000000000000000',
    '3700000000000000000000000000000000000000000000000000000000000000',
    // ...添加其他私钥
];

// 合约地址和ABI（替换为您的合约地址和正确的ABI）
const contractAddress = '0x47129e886b44B5b8815e6471FCD7b31515d83242'; // 替换为您的合约地址
const contractABI = [
    // create 函数（不带 deadline 和 onBehalfOf）
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
    // redeem 函数（不带 deadline 和 onBehalfOf）
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
    // ...如果需要其他函数，可以继续添加
];

// 定义要执行的任务
const tasks = [


    {
        type: 'function',
        taskNumber: 2,
        operation: 'create',
        tokenType: 0, 
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改
        minAmount: ethers.constants.Zero // 0
    },

    // 任务4 - 调用 create 函数（不带 deadline 和 onBehalfOf）
    {
        type: 'function',
        taskNumber: 4,
        operation: 'create',
        tokenType: 1, 
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改
        minAmount: ethers.constants.Zero // 0
    },

    // 任务6 - 调用 redeem 函数（不带 deadline 和 onBehalfOf）
    {
        type: 'function',
        taskNumber: 6,
        operation: 'redeem',
        tokenType: 0, 
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改
        minAmount: ethers.constants.Zero // 0
    },

    // 任务8 - 调用 redeem 函数（不带 deadline 和 onBehalfOf）
    {
        type: 'function',
        taskNumber: 8,
        operation: 'redeem',
        tokenType: 1, 
        depositAmount: ethers.utils.parseEther('0.1'), //可以自己改
        minAmount: ethers.constants.Zero // 0
    }

];

// 生成随机的Gas价格
function getRandomGasPrice() {
    // 基础Gas价格为1.5 GWEI
    const baseGasPrice = ethers.utils.parseUnits('1.5', 'gwei'); // 1.5 GWEI

    // 随机增加0.00001到0.00100 GWEI
    const minAddition = ethers.BigNumber.from('10000'); 
    const maxAddition = ethers.BigNumber.from('1000000'); 

    // 生成一个在[minAddition, maxAddition]范围内的随机数
    const randomAddition = ethers.BigNumber.from(
        Math.floor(Math.random() * (maxAddition.toNumber() - minAddition.toNumber())) + minAddition.toNumber()
    );

    // 返回总的Gas价格
    return baseGasPrice.add(randomAddition);
}

// 发送指定交易数据的函数
async function sendTransactionTask(wallet, task) {
    const tx = {
        to: contractAddress, 
        value: ethers.constants.Zero, 
        data: task.data,
        gasPrice: getRandomGasPrice(),

    };

    try {
        console.log(`正在执行任务${task.taskNumber}: 向合约 ${contractAddress} 发送交易`);
        const response = await wallet.sendTransaction(tx);
        console.log(`任务${task.taskNumber}的交易哈希: ${response.hash}`);

        await response.wait();
        console.log(`任务${task.taskNumber}的交易已确认。\n`);
    } catch (error) {
        // 将错误的私钥写入error.txt文件
        fs.appendFileSync('mission_dayday_error.txt', `${wallet.privateKey}\n`); // 错误文件
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
            // 调用不带 deadline 和 onBehalfOf 参数的版本
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
            // 调用不带 deadline 和 onBehalfOf 参数的版本
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

// 随机打乱数组的顺序（Fisher-Yates Shuffle算法）
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 主流程
async function main() {
    while (true) { // 无限循环
        console.log("开始新一轮任务执行...\n");

        // 打乱私钥顺序
        const shuffledPrivateKeys = [...privateKeys];
        shuffleArray(shuffledPrivateKeys);

        for (const privateKey of shuffledPrivateKeys) {
            const wallet = new ethers.Wallet(privateKey, provider);
            console.log(`开始处理钱包地址: ${wallet.address}\n`);

            await processForWallet(wallet);
        }

        console.log("所有交易已完成！等待23小时50分钟后再次执行...\n");

        // 等待23小时50分钟（23 * 60 + 50 = 1430分钟 = 85800000毫秒）
        await sleep(85800000);
    }
}

// 启动主流程并处理可能的未捕获错误
main().catch((error) => {
    console.error("主流程中发生错误:", error);
});
