const { starProjects } = require("./src/task")
const { getAccountCreateView, getAccountView } = require("./src/account")
const program = require('commander')
const pkg = require('./package.json')

program
  .version(pkg.version)
  .option('-s, --star', '开始star')
  .option('-l, --login', '重新登录')
  .option('-a, --accounts', '查看账号信息')
  .parse(process.argv);

if (program.star) starProjects();
if (program.login) getAccountCreateView();
if (program.accounts) getAccountView();
