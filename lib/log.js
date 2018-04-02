const chalk = require('chalk');

const moment = require('moment');

const log = console.log;

const getCurDate = () => moment().format('YYYY-MM-DD hh:mm:ss');

const getMessage = (type, msg) => log(chalk.green(`【gitstar ${type}:${getCurDate()}】` + msg));

exports.success = msg => getMessage('success', msg);

exports.error = msg => getMessage('error', msg);

exports.info = msg => getMessage('info', msg);