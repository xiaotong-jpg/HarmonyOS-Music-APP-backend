// 引入所有需要的 Sequelize 模型
//const { Consumer, PlayRecord, ListeningReport, Song } = require('../model/index');
const { Op, Sequelize } = require('sequelize');

/**
 * 为单个用户生成指定周期的报告
 * @param {object} options - 包含 userId, report_type, period 的对象
 */
async function generateSingleReport(models,{ user_id, report_type, period }) {
    const { playRecord, listeningReport, song } = models;
    // --- 1. 计算时间范围 ---
    let startDate, endDate;
    if (report_type === 'daily') {
        startDate = new Date(`${period}T00:00:00`);
        endDate = new Date(`${period}T23:59:59`);
    } else if (report_type === 'monthly') {
        startDate = new Date(`${period}-01T00:00:00`);
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
    } else {
        throw new Error('无效的 report_type');
    }

    // --- 2. 查询播放记录 ---
    const playRecords = await playRecord.findAll({
        where: {
            user_id: user_id,
            play_time: {
                [Op.between]: [startDate, endDate],
            },
        },
        include: [{ model: song, attributes: ['singer_id'] }]
    });

    if (playRecords.length === 0) {
        console.log(`用户 ${user_id} 在 ${period} 没有播放记录，跳过生成。`);
        return; // 没有记录就直接返回
    }

    // --- 3. 数据分析 (这部分逻辑和你之前在 controller 里写的一样) ---
    const total_songs_played = playRecords.length;
    const songCounts = {}, singerCounts = {}, hourCounts = {};

    playRecords.forEach(record => {
        songCounts[record.song_id] = (songCounts[record.song_id] || 0) + 1;
        if (record.song && record.song.singer_id) {
            singerCounts[record.song.singer_id] = (singerCounts[record.song.singer_id] || 0) + 1;
        }
        const hour = new Date(record.play_time).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const findMaxKey = (obj) => Object.keys(obj).length > 0 ? Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b) : null;
    
    // --- 4. 组装报告数据 ---
    const reportData = {
        user_id,
        report_type,
        report_period: period,
        total_songs_played,
        favorite_song_id: parseInt(findMaxKey(songCounts)),
        favorite_singer_id: parseInt(findMaxKey(singerCounts)),
        most_active_hour: parseInt(findMaxKey(hourCounts)),
        // 其他字段可以先为 null 或 0
    };

    // --- 5. 使用 upsert 存储到数据库 ---
    await listeningReport.upsert(reportData);
    console.log(`成功为用户 ${user_id} 生成了 ${period} 的${report_type}报告。`);
}

module.exports = {
    generateSingleReport
};