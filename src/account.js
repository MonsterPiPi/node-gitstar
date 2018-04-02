const fs = require("fs-extra")
const log = require("./log")
const Table = require("cli-table2")
const inquirer = require("inquirer")
const SAVE_PATH = "/tmp/gitstar.json"

const getAccount = async () => {
    await fs.ensureFile(SAVE_PATH)
    const accounts = await fs.readFile(SAVE_PATH)
    if (accounts) {
        return await JSON.parse(accounts)
    }
}

const updateAccount = async (data)=>{
    await fs.ensureFile(SAVE_PATH)
    fs.writeFile(SAVE_PATH, JSON.stringify(data, null, 4), "utf8")
}

const required = (input)=>{
    if(input) return true
    else return '必填项，请务必填写'
}

const getAccountCreateView = async ()=>{
    try{
        const accounts = await inquirer.prompt([
            {
                type: "input",
                name: "gitstar_account_name",
                validate:required,
                message: "请输入gitstar账号名称"
            },
            {
                type: "password",
                name: "gitstar_account_password",
                validate:required,
                message: "请输入gitstar账号密码"
            },
            {
                type: "input",
                name: "github_account_name",
                validate:required,
                message: "请输入github账号名称(推荐小号)"
            },
            {
                type: "password",
                name: "github_account_password",
                validate:required,
                message: "请输入github账号密码"
            }
        ])

        updateAccount(accounts)

        log.success('账号数据更新成功!')

        return accounts
    } catch (e) {
        throw '账号数据创建失败'
    }
}

const getAccountView = async () => {
    try {
        const AccountTable = new Table({
            head: ["类型", "值"],
            colWidths: [50, 50]
        })
        const accounts = await getAccount()

        if (accounts) {
            Object.keys(accounts).forEach(key => {
                AccountTable.push([key, accounts[key]])
            })
            log.info("\n" + AccountTable.toString())
        }
    } catch (e) {
        throw '账号数据获取失败'
    }
}


module.exports = {
    getAccount,
    getAccountView,
    getAccountCreateView,
    updateAccount
}


