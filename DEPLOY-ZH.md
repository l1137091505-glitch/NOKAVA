# NOKAVA 部署步骤

## 1. 上传 GitHub

1. 在 GitHub 新建公开仓库，例如 `nokava`。
2. 不需要额外创建 README、License 或 `.gitignore`。
3. 解压上传包，把包内全部文件和文件夹上传到仓库根目录并提交。

## 2. 部署合约

1. 打开 Remix，在 `contracts` 目录新建 `NokavaSignal.sol`。
2. 复制本项目 `contracts/src/NokavaSignal.sol` 的全部代码并保存。
3. 使用 Solidity **0.8.24** 编译。
4. 打开 **Deploy & Run Transactions**，Environment 选择 **Browser Extension / MetaMask**。
5. 将钱包切换到 BOT Chain Mainnet（Chain ID 677）。
6. 选择 `NokavaSignal` 并点击 Deploy。构造函数没有参数，也不需要支付 BOT。
7. 复制 Remix 中完整的已部署合约地址。

## 3. 部署网页

1. 在 Vercel 点击 Add New → Project，导入刚才的 GitHub 仓库。
2. Root Directory 选择 `frontend`。
3. Framework Preset 选择 `Vite`。
4. 添加 Environment Variable：

```text
Key: VITE_NOKAVA_ADDRESS
Value: 0x你的完整合约地址
Environment: Production
Type: Config
```

5. 点击 Deploy。若变量是在首次部署后添加，进入 Deployments → 最新部署 → Redeploy，且不要使用旧 Build Cache。

## 4. 网页交互

1. 打开生产网址，点击右上角 **Connect wallet**。
2. 从列表选择钱包；网页会在需要时请求添加或切换到 BOT Chain。
3. 在 **Recipient address** 输入收件人的 `0x...` 地址。
4. 点击 **Send a signal**，在钱包中确认交易。
5. 确认后页面会刷新总数、你的发送/接收数与最近回执。

合约地址是公开信息，应使用 Config；不要把助记词或私钥填写到 Vercel、GitHub 或网页。
