const fs = require("fs-extra");

const log = require("./log");

const axios = require("axios");

const get = require("lodash.get");

const querystring = require("query-string");

const Table = require("cli-table2");

const {
  getLoginInfo
} = require("./login");

const path = require("path");

const chalk = require("chalk");

const ProgressBar = require("progress");

const Spinner = require("cli-spinner").Spinner;

const pm2 = require("pm2");

const sleep = (duration = 1000) => {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
};

const loginGitStar = async () => {
  const accounts = await getLoginInfo();
  const response = await axios({
    url: "http://gitstar.top:88/api/user/login",
    method: "post",
    data: querystring.stringify({
      username: accounts.gitstar_account_name,
      password: accounts.gitstar_account_password
    })
  });

  if (response.status === 200 && get(response, "data.Code") !== 0) {
    return {
      accounts,
      gitStarCookie: response.headers["set-cookie"].join(",")
    };
  } else {
    throw get(response, "data.Msg") || "登录失败，请确认您的账号密码是否正确";
  }
};

const getRecommendProjects = async () => {
  const {
    accounts,
    gitStarCookie
  } = await loginGitStar();
  const res = await axios({
    url: `http://gitstar.top:88/api/users/${accounts.gitstar_account_name}/status/recommend`,
    method: "get",
    headers: {
      Accept: "application/json",
      Cookie: gitStarCookie
    }
  });

  if (res.status == 200 && !get(res, "data.Msg") && get(res, "data.Code") !== 0) {
    return {
      accounts,
      gitStarCookie,
      projects: res.data
    };
  } else {
    throw get(res, "data.Msg") || "获取推荐项目失败，请刷新重试";
  }
};

const starProjects = async () => {
  const spinner = new Spinner(chalk.yellow("点赞准备中... %s"));
  spinner.setSpinnerString("|/-\\");
  spinner.start();

  try {
    const {
      accounts,
      gitStarCookie,
      projects
    } = await getRecommendProjects();
  } catch (e) {
    spinner.stop(true);
    log.error(e);
    process.exit(2);
  }

  spinner.stop(true);
  const starred = [];
  let errors = 0,
      success = 0;
  const Bar = new ProgressBar(chalk.yellow("正在点赞中... [:bar] :rate/bps :percent :elapseds"), {
    complete: "=",
    incomplete: " ",
    width: 20,
    total: projects.length
  });

  for (let i = 0; i < projects.length; i++) {
    const item = projects[i];

    try {
      const res = await axios({
        url: "https://api.github.com/user/starred/" + item.Repo,
        method: "put",
        headers: {
          "Content-Length": "0"
        },
        auth: {
          username: accounts.github_account_name,
          password: accounts.github_account_password
        }
      });
      success++;
      starred.push({
        repo: item.Repo,
        status: chalk.green("点赞成功")
      });
    } catch (e) {
      errors++;
      starred.push({
        repo: item.Repo,
        status: chalk.red("点赞失败")
      });
    }

    Bar.tick(1);
    await sleep(500);
  }

  const StarredTable = new Table({
    head: ["项目地址", "状态"],
    colWidths: [50, 20]
  });

  if (starred.length == 0) {
    StarredTable.push(["暂无项目可点赞", ""]);
  }

  starred.forEach(item => {
    StarredTable.push([item.repo, item.status]);
  });
  log.success(`总共成功点赞${success}个项目！`);

  if (errors) {
    log.error(`其中${errors}个项目点赞失败！`);
  }

  log.info("\n" + StarredTable.toString());

  if (starred.length == 0) {
    return;
  }

  var spinner2 = new Spinner("正在刷新项目... %s");
  spinner2.setSpinnerString("|/-\\");
  spinner2.start();

  try {
    const updatestar = await axios({
      url: "http://gitstar.top:88/star_update",
      method: "get",
      headers: {
        Accept: "application/json",
        Cookie: gitStarCookie
      },
      auth: {
        username: accounts.github_account_name,
        password: accounts.github_account_password
      }
    });
    spinner2.stop(true);

    if (updatestar && !get(updatestar, "data.Msg") && get(updatestar, "data.Code") !== 0) {
      log.success("项目刷新成功！");
    }
  } catch (e) {
    spinner2.stop(true);
    log.error("项目刷新失败！");
  }
};

const startBgTask = async cron => {
  const accounts = await getLoginInfo();

  if (cron === true || cron === undefined || cron === null) {
    cron = "*/5 * * * *";
  }

  pm2.connect(function (err) {
    if (err) {
      log.error(err);
      process.exit(2);
    }

    pm2.start({
      name: "gitstar_worker",
      script: path.resolve(__dirname, "./worker.js"),
      // Script to be run
      args: [`--cron=${cron}`]
    }, function (err, apps) {
      if (err) {
        log.error(err);
        return pm2.disconnect();
      }

      log.success(`定时任务启动成功`);
      pm2.disconnect(); // Disconnects from PM2
    });
  });
};

const stopBgTask = () => {
  pm2.delete("gitstar_worker", function (err, apps) {
    if (err) {
      log.error(err);
      return process.exit(2);
    }

    log.success(`定时任务已关闭`);
    process.exit(2);
  });
};

module.exports = {
  starProjects,
  startBgTask,
  stopBgTask
};