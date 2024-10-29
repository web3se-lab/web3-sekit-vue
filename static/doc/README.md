# SmartIntentNN

![SmartIntentNN Example](./example.png)

_Note: The full documentation will be open after the paper is published._

## Online

To try our research tools online, please visit the following website:

👉 <https://www.web3-se.com>

## Introduction

🤩 **SmartIntentNN** is a deep neural network tool powered by [Tensorflow.js](https://www.tensorflow.org/js).

**Task:** Build a DNN-based model to detect developers' malicious intents in smart contracts.

**Website:** <https://www.web3-se.com>

**Technical Guide:**

-   📱 Pages for testing the model online: [Home](https://www.web3-se.com/), [Highlight](https://www.web3-se.com/highlight/), [Evaluation](https://www.web3-se.com/evaluate/)
-   🕵️ Click **"Detect My Smart Contract"** to copy and detect your customized smart contract.
-   🚀 Click **"Predict 🚀"** to detect the malicious intents in smart contracts.
-   🌲 Click **"CCTree 🌲"** to view the smart contract code tree.

**Technical Points:**

-   SmartIntentNN V1.0 is trained and evaluated on **Tensorflow.js**.
-   SmartIntentNN V1.0 employs a **Universal Sentence Encoder** to generate smart contract embeddings.
-   The intent highlight model is trained using **K-means clustering**.

## Dataset

**💽 Use our dataset: <https://api.smart.cas-ll.cn>**

The above URL provides a `GET/POST JSON` API.
You can query data by changing the parameter `key` in the URL.

### Smart Contract Intent

<https://api.smart.cas-ll.cn/data/intent?key=1>

Please iterate over keys: `1, 2, 3, ...`. If an error occurs, skip that key and continue (key++, continue)

Ground truth label distribution for Intent data:

| Intent Type    | Explanation                                                                                                      | Num   |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ----- |
| Fee            | Arbitrarily changes transaction fees, transferring them to specified wallet addresses.                           | 33268 |
| DisableTrading | Enables or disables trading actions on a smart contract.                                                         | 6617  |
| Blacklist      | Restricts designated users' activities, potentially infringing on fair trade rights.                             | 4729  |
| Reflection     | Redistributes taxes from transactions to holders based on their holdings, attracting users to buy native tokens. | 46452 |
| MaxTX          | Limits the maximum number or volume of transactions.                                                             | 17043 |
| Mint           | Issues new tokens, either unlimited or controlled.                                                               | 10572 |
| Honeypot       | Traps user-provided funds under the guise of leaking funds.                                                      | 290   |
| Reward         | Rewards users with crypto assets to encourage token use, despite possible lack of value.                         | 4178  |
| Rebase         | Adjusts token supply algorithmically to control price.                                                           | 659   |
| MaxSell        | Limits specified users' selling times or amounts to lock liquidity.                                              | 68    |

### Models

🤖 Access **SmartIntentNN V1.0** models: <https://github.com/web3se-lab/web3-sekit-vue/releases/tag/V1>

-   Download `v1.zip`, then unzip and move them to `/tf/models/v1/`.
-   For **Universal Sentence Encoder**, download <https://tfhub.dev/google/universal-sentence-encoder/4>, then move it to `/tf/models/` and rename the dir as `universal-sentence-encoder`.
-   For **K-means intent highlight model**, download `kmeans-model.json`, then move it to `/tf/models/kmeans-model.json`.

The structure of directory should be like the following figure:

<img height=320px src=./dir.png>

How to run these models in Tensorflow.js?

-   To predict: `node tf/v1/use-high-bilstm-x2.js predict 1`
-   To evaluate: `node tf/v1/use-high-bilstm-x2.js evaluate`
-   To train: `node tf/v1/use-high-bilstm-x2.js train`
-   To summary: `node tf/v1/use-high-bilstm-x2.js summary`

### Training & Evaluating Settings

See settings in `/tf/v1/model.js`.

**Training**

Scope: 1, 10000
Batch: 200
Batch Size: 50
Epoch: 100

**Evaluating**

Scope: 20000, 10000

## Install

Before using this program, you will need to install **nodejs** and **npm** tools first, then you install dependencies.

Our recommended version is Node.js v16+.

```bash
yarn
# or
npm install
```

## Database

If you would like to set up a localhost database, we prepare a `docker-compose.yml` for you.

To start a MySQL docker service locally, try:

```bash
docker-compose -f ./docker/docker-compose.yml
```

To connect to local mysql database, you can create and modify the `.env` as the following content:

```bash
# DB
DB_DIALECT=mysql
MYSQL_HOST=localhost
MYSQL_USER=web3
MYSQL_PASS=web3
MYSQL_DB=web3

# SMARTBERT
EMBED_API=

# this service port
WEB_PORT=8081

# for CPU mode
TFJS=@tensorflow/tfjs-node
# for GPU mode
# TFJS=@tensorflow/tfjs-node-gpu
```

Then you can test your database connection and create the initial tables:

```bash

# test connect to databases
node ./db/DB.js test

# init tables, if table is not input, default is all the tables
node ./db/DB.js init [table_name]

# drop tables, be careful!
node ./db/DB.js drop [table_name]

```

We use [sequelize](https://sequelize.org/) to manage a database.

For the details of data structures, please refer to `db/Model.js`

To get the entire database file, pleas contact us: **Open after paper published**

## Web

**Serve Web APIs**

```bash
# development mode
yarn dev
# product mode
yarn start
# stop web service
yarn stop
```

**APIs for dataset**

-   [data/get](http://api.smart.cas-ll.cn/data/get)
-   [data/intent](http://api.smart.cas-ll.cn/data/intent)
-   [data/vulnerability](http://api.smart.cas-ll.cn/data/vulnerability)

## Resource

### DataSource

1. [https://bscscan.com/](https://bscscan.com/)
2. [https://etherscan.io/](https://etherscan.io/)
3. [https://tokensniffer.com/](https://tokensniffer.com/)
4. [https://bscheck.eu/](https://bscheck.eu/)
5. [https://scamsniper.net/](https://scamsniper.net/)
6. [https://aphd.github.io/smart-corpus/](https://aphd.github.io/smart-corpus/)
7. [https://dashboard.tenderly.co/explorer/](https://dashboard.tenderly.co/explorer/)
8. [https://tools.staysafu.org/](https://tools.staysafu.org/)

### Dependency

1. [TensorFlow.js](https://js.tensorflow.org/api/latest/)
2. [TensorFlow Hub](https://tfhub.dev/)
3. [Universal Sentence Encoder V4](https://tfhub.dev/google/universal-sentence-encoder/4)
