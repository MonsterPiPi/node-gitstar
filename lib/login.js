const fs = require("fs-extra");

const log = require("./log");

const {
  getAccount,
  updateAccount,
  getAccountCreateView
} = require("./account");

const getLoginInfo = async () => {
  const accounts = await getAccount();

  if (accounts) {
    return accounts;
  } else {
    return getAccountCreateView();
  }
};

const createLoginInfo = async () => {
  return getAccountCreateView();
};

module.exports = {
  getLoginInfo,
  createLoginInfo
};