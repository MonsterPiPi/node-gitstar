const {
  starProjects,
  startBgTask,
  stopBgTask
} = require("./task");

const {
  getAccountCreateView,
  getAccountView
} = require("./account");

const program = require("commander");

const pkg = require("../package.json");

program.version(pkg.version).option("-s, --star", "开始star").option("-l, --login", "重新登录").option("-a, --accounts", "查看账号信息").option("--bg_start [value]", '后台运行点赞，使用cron表达式，比如 gitstar --bg_start="*/5 * * * *" 默认5分钟执行一次', "*/5 * * * *").option("--bg_stop", "停止后台点赞程序").parse(process.argv);
if (program.star) starProjects();
if (program.login) getAccountCreateView();
if (program.accounts) getAccountView();
if (program.bg_start) startBgTask(program.bg_start);
if (program.bg_stop) stopBgTask();