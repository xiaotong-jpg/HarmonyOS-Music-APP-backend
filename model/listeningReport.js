module.exports = (sequelize, DataTypes) => {
    const ListeningReport = sequelize.define("listening_report", { // 模型名用单数
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '用户ID, 关联 consumers.id'
        },
        report_type: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: '报告类型: monthly, yearly'
        },
        report_period: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: '报告周期, e.g., "2024-07", "2024"'
        },
        total_songs_played: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '总播放歌曲数'
        },
        total_duration_played_seconds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '总播放时长(秒)'
        },
        favorite_song_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '月度/年度之歌ID'
        },
        favorite_singer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '月度/年度艺人ID'
        },
        most_active_hour: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '最活跃小时(0-23)'
        },
        keyword_of_the_period: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '周期关键词'
        },
        raw_data_json: {
            type: DataTypes.JSON, // Sequelize 支持 JSON 类型
            allowNull: true,
            comment: '原始统计数据，备用'
        }
    }, {
        // 明确指定表名，以匹配我们的 SQL CREATE TABLE 语句
        tableName: 'listening_reports',

        // Sequelize 默认会添加 createdAt 和 updatedAt 字段，
        // 这和我们的 SQL 设计是一致的，所以保持 timestamps: true
        timestamps: true,

        // 在这里可以添加索引，与 SQL 中的索引定义相对应
        indexes: [
            {
                // 创建一个联合唯一索引
                unique: true,
                fields: ['user_id', 'report_type', 'report_period'],
                name: 'unique_user_report' // 索引名称，与SQL中一致
            }
        ]
    });

    return ListeningReport;
};