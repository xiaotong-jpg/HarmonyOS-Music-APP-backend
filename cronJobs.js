const cron = require('node-cron');
const models = require('./model/index');
const { generateSingleReport } = require('./services/reportService');

async function getAllUserIds() {
    const users = await models.consumer.findAll({
        attributes: ['id']
    });
    return users.map(user => user.id);
}

// ... (getFormattedDate 函数不需要修改) ...

function startScheduledJobs() {
    // 为了开发测试，我们依然使用一个较短的周期，比如每1分钟
    cron.schedule('* * * * *', async () => {
        console.log('--- [CRON] 开始执行【更新至最新月份】的报告任务 ---');
        try {
            const userIds = [2]

            // 【核心修改】获取当前日期，并格式化为 "YYYY-MM"
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const currentPeriod = `${year}-${month}`; // 例如："2025-07"

            console.log(`[CRON] 将为 ${userIds.length} 个用户更新 ${currentPeriod} 的月报...`);

            for (const userId of userIds) {
                await generateSingleReport(models, {
                    user_id: userId,
                    report_type: 'monthly',
                    // 【核心修改】使用当前月份作为 period
                    period: currentPeriod 
                });
            }
        } catch (error) {
            console.error('--- [CRON] 更新最新月份报告任务执行失败 ---', error);
        }
        console.log('--- [CRON] 更新最新月份报告任务执行完毕 ---');
    }, {
        scheduled: true,
        timezone: "Asia/Shanghai"
    });

    console.log('--- 定时任务已启动 (模式：更新至最新月份) ---');
}

module.exports = {
    startScheduledJobs
};