// faucet.js

const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');

// 定义目标地址数组
const targetAddresses = [
'0x45F53736AD6302859',
'0x38172E8b28',
'0xa34b963748a7',
'0x63d020eb6',
];

const proxies = [
  'socks5://wLA0CvJjhFQOW81u:pLhPeV1JhHOhvmyO_countryime-30m_streaming-1@103.214.44.131:32325',
  'socks5://wLA0CvJjhFQOW81u:pLhPeV1JhHOhvmyO_countryime-30m_streaming-1@103.214.44.131:32325',
  'socks5://wLA0CvJjhFQOW81u:pLhPeV1JhHOhvmyO_countryime-30m_streaming-1@103.214.44.131:32325',
  'socks5://wLA0CvJjhFQOW81u:pLhPeV1JhHOhvmyO_countryime-30m_streaming-1@103.214.44.131:32325',
];

// 检查代理数量是否至少与地址数量相同
if (proxies.length < targetAddresses.length) {
  console.error('错误：代理数量少于地址数量。请确保代理数量至少与地址数量相同。');
  process.exit(1);
}

const apiUrl = 'https://api.plaza.finance/faucet/queue';

// 定义请求头
const commonHeaders = {
  'Accept': '*/*',
  'Accept-Language': 'en-AU,en-GB;q=0.9,en;q=0.8',
  'Content-Type': 'application/json',
  'Origin': 'https://testnet.plaza.finance',
  'Referer': 'https://testnet.plaza.finance/',
  'Sec-CH-UA': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-CH-UA-Mobile': '?0',
  'Sec-CH-UA-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/120.0.0.0 Safari/537.36',
  'x-plaza-api-key': 'bfc7b70e-66ad-4524-9bb6-733716c4da94', 
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const sendFaucetRequest = async (address, proxy) => {
  try {
    const agent = new SocksProxyAgent(proxy);
    const response = await axios.post(apiUrl, { address }, {
      headers: commonHeaders,
      httpsAgent: agent,
      proxy: false, // 禁用 Axios 内置的代理设置
      timeout: 10000, // 可选：设置请求超时时间（毫秒）
    });

    // 根据响应判断是否成功
    if (response.data && response.data.success) {
      console.log(`地址 ${address} 领取今日测试币成功。`);
    } else {
      console.error(`地址 ${address} 请求成功，响应数据:`, response.data);
    }
  } catch (error) {
    if (error.response) {
      console.error(`地址 ${address} 请求失败！状态码: ${error.response.status}`);
      console.error('响应数据:', error.response.data, '\n');
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error(`地址 ${address} 无响应：`, error.request, '\n');
    } else {
      // 其他错误
      console.error(`地址 ${address} 请求设置错误：`, error.message, '\n');
    }
  }
};

// 函数：等待指定的毫秒数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 主函数：处理所有地址并使用对应的代理发送请求
const processAddresses = async () => {
  // 创建地址与代理的配对数组
  const addressProxyPairs = targetAddresses.map((address, index) => ({
    address,
    proxy: proxies[index],
  }));

  // 随机打乱配对顺序
  shuffleArray(addressProxyPairs);

  for (const pair of addressProxyPairs) {
    const { address, proxy } = pair;
    console.log(`使用代理 ${proxy} 发送请求到地址 ${address}`);
    await sendFaucetRequest(address, proxy);
    // 添加延迟以避免触发速率限制
    await delay(1000); // 延迟 1 秒
  }
};

// 函数：无限循环执行 processAddresses，每次间隔 23 小时 55 分钟
const main = async () => {
  while (true) {
    console.log('开始领取今日测试币...');
    await processAddresses();
    console.log('所有地址已处理。等待 23 小时 55 分钟后再次执行。\n');
    await delay(23 * 60 * 60 * 1000 + 55 * 60 * 1000); 
  }
};

// 执行主函数
main();
