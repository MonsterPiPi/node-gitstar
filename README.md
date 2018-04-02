# node-gitstar
> gitstar.cn互刷项目自动刷赞脚本



## 安装

```bash
npm install -g node-gitstar
```



## 使用教程



### 刷赞

```bash
gitstar -s(--star)
```



### 更新账号信息

```
gitstar -l(--login)
```



### 查看账号信息

```bash
gitstar -a(--accounts)
```

### 后台定时任务刷新

```bash
gitstar --bg_start="*/5 * * * *"
```
--bg_start默认参数是5分钟执行一次，您可以借助cron表达式自定义定时任务

### 停止后台定时任务

```bash
gitstar --bg_stop
```
