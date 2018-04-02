const { starProjects } = require("./task")
const schedule = require("node-schedule")
const program = require("commander")
const path = require("path")
const fs = require("fs-extra")
program.option("--cron [value]", "定时参数", "*/5 * * * *").parse(process.argv)
schedule.scheduleJob(program.cron, async () => {
    try {
        await starProjects()
    } catch (e) {
        console.log(e)
    }
})
