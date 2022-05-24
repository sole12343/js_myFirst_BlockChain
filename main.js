//js 手动搭建区块链

// data 
// 之前区块的哈希值
// 自己的哈希值：由存储在区块里的信息 计算出来的(data + 之前区块的哈希值)

const sha256 = require("crypto-js/sha256");

//
class Transaction {
    constructor(from, to, amount) {
        this.from = from
        this.to = to
        this.amount = amount
            // this.timestamp = timestamp 这里不需要时间戳，因为所有交易的时间应该是交易写入区块的时间，那么是在区块被挖出来才有的
    }

}
class Block {
    constructor(transactions, previousHash) {
        //data要从string --> 变成 object数组
        this.transactions = transactions
        this.previousHash = previousHash
        this.timestamp = Date.now()
        this.hash = this.computeHash()
        this.nonce = 1
    }
    computeHash() {
        //这里的data也要变成对象数组
        return sha256(JSON.stringify(this.data + this.previousHash + this.nonce + this.timestamp)).toString()
    }

    //开头前n位为0即难度
    //此处返回n个0的字符串
    getAnswer(difficulty) {
        let answer = ''
        for (let i = 0; i < difficulty; i++) {
            answer += '0'
        }
        return answer
    }

    //计算符合区块链难度的hash
    mine(difficulty) {
        while (true) {
            if (this.hash.substring(0, difficulty) !== this.getAnswer(difficulty)) {

                this.nonce++
                    this.hash = this.computeHash()
            } else {
                console.log('挖矿结束');
                console.log(this.hash);
                break
            }
        }
    }
}


//区块 的链
class Chain {
    constructor() {
        this.chain = [this.Bigbang()]
        this.difficulty = 4
        this.transactionPool = []
        this.minerReward = 50
    }

    //生成祖先区块
    Bigbang() {
        const gensisBlock = new Block('我是祖先', '')
        return gensisBlock
    }

    //找到并返回当前区块链的最后一个区块
    getLastestBlock() {
        return this.chain[this.chain.length - 1]
    }

    //添加transaction 到transactionPool
    addTransaction(transaction) {
        this.transactionPool.push(transaction)
    }

    //添加区块到区块链上
    addBlockToChain(newBlock) {
        //data
        //找到最近一个block的hash
        //这就是新区块的previousHash
        newBlock.previousHash = this.getLastestBlock().hash
            // newBlock.hash = newBlock.computeHash()
        newBlock.mine(this.difficulty)
        this.chain.push(newBlock)
    }

    mineTransactionPool(minerRewardAddress) {
        //发放矿工奖励
        const minerRewardTransaction = new Transaction(
            "", minerRewardAddress, this.minerReward
        )

        this.transactionPool.push(minerRewardTransaction)

        //挖矿
        const newBlock = new Block(this.transactionPool, this.getLastestBlock().hash)
        newBlock.mine(this.difficulty)

        //添加区块到区块链上
        this.chain.push(newBlock)
        this.transactionPool = []
    }


    // 验证当前区块链是否合法
    // 当前的数据有没有被篡改
    // 验证当前区块的previousHash 是否等于 previous区块的hash
    validateChain() {
        // 验证第一个区块
        if (this.chain.length === 1) {
            if (this.chain[0].hash !== this.chain[0].computeHash()) {
                return false
            }
            return true
        }

        // 验证第二个区块和以后的区块 第二个区块是i等于1
        for (let i = 1; i < this.chain.length; i++) {
            const blockToValidate = this.chain[i]

            //验证当前数据有没有被篡改
            if (blockToValidate.hash !== blockToValidate.computeHash()) {
                console.log('数据篡改');
                return false
            }

            //验证当前区块的previousHash是否等于前一个区块的hash
            let previousBlock = this.chain[i - 1]
            if (blockToValidate.previousHash !== previousBlock.hash) {
                console.log('前后区块链断裂');
                return false
            }
        }
        return true
    }
}

const luojiaChain = new Chain()
const t1 = new Transaction('add1', 'add2', 10)
const t2 = new Transaction('add2', 'add1', 5)
luojiaChain.addTransaction(t1)
luojiaChain.addTransaction(t2)
    // console.log(luojiaChain);

luojiaChain.mineTransactionPool('add3')
console.log(luojiaChain);
console.log('****************');
console.log(luojiaChain.chain[1].transactions);
// const block1 = new Block('转账十元', '')
// luojiaChain.addBlockToChain(block1)

// const block2 = new Block('转账一百元', '')
// luojiaChain.addBlockToChain(block2)

// console.log(luojiaChain);
// console.log(luojiaChain.validateChain());

// //尝试篡改区块链数据
// luojiaChain.chain[1].data = '转账一百个十元'
// luojiaChain.chain[1].mine(5)
// console.log(luojiaChain);
// console.log(luojiaChain.validateChain());
