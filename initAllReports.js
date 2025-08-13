/**
 * ======================================================================
 *  一次性脚本：清空旧报告，然后智能扫描播放记录，重新生成所有报告
 * ======================================================================
 */

const models = require('./model/index');
const { generateSingleReport } = require('./services/reportService');
const { Sequelize } = require('sequelize');

async function getAllUserIds() {
    const users = await models.consumer.findAll({
        attributes: ['id']
    });
    console.log(`查询到 ${users.length} 个用户:`, users.map(u => u.id));
    return users.map(user => user.id);
}

async function getUniqueMonthsFromPlayRecords() {
    console.log("正在从播放记录中扫描所有涉及的月份...");
    const records = await models.playRecord.findAll({
        attributes: [
            [Sequelize.fn('DATE_FORMAT', Sequelize.col('play_time'), '%Y-%m'), 'month']
        ],
        group: ['month'],
        order: [['month', 'ASC']],
        raw: true
    });
    const months = records.map(record => record.month);
    console.log("扫描完成，需要处理的月份有:", months);
    return months;
}

/**
 * 【新增】清空听歌报告表的函数
 */
async function clearListeningReports() {
    console.log("--- 正在清空旧的听歌报告数据... ---");
    try {
        // 使用 sequelize.query 来执行原始的 SQL 语句
        // TRUNCATE TABLE 是最高效的清空方式
        await models.sequelize.query('TRUNCATE TABLE `listening_reports`');
        console.log("--- `listening_reports` 表已成功清空。 ---");
    } catch (error) {
        console.error("清空报告表失败:", error);
        // 如果清空失败，我们可能不希望继续执行，所以抛出错误
        throw error;
    }
}

/**
 * 主执行函数
 */
async function runInitialization() {
    console.log('--- 开始执行【全部月度报告】的生成任务 ---');

    try {
        // 1. 【新增】首先清空旧的报告表
        await clearListeningReports();

        // 2. 动态获取月份
        const monthsToProcess = await getUniqueMonthsFromPlayRecords();
        
        // 3. 【修改】如果播放记录为空，直接结束任务
        if (monthsToProcess.length === 0) {
            console.log('播放记录为空，没有需要处理的月份。任务结束。');
            // 注意：因为我们已经清空了报告表，所以这里直接退出即可
            process.exit(0);
            return;
        }

        const userIds = await getAllUserIds();

        if (userIds.length === 0) {
            console.log('数据库中没有用户，任务结束。');
            process.exit(0);
            return;
        }

        console.log(`将为 ${userIds.length} 个用户生成 ${monthsToProcess.length} 个月份的报告...`);

        // 4. 双层循环生成新报告
        for (const userId of userIds) {
            console.log(`\n--- 正在处理用户 ID: ${userId} ---`);
            for (const period of monthsToProcess) {
                await generateSingleReport(models, {
                    user_id: userId,
                    report_type: 'monthly',
                    period: period
                });
            }
        }

    } catch (error) {
        console.error('--- 任务执行过程中发生错误 ---', error);
    } finally {
        console.log('\n--- 全部月度报告生成任务执行完毕 ---');
        process.exit(0);
    }
}

// 运行主函数
runInitialization();