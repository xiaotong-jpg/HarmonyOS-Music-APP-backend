module.exports = (sequelize, DataTypes) => {
    const PlayRecord = sequelize.define("play_record", { // 模型名用单数
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '用户ID'
        },
        song_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '歌曲ID'
        },
        song_list_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '歌单ID'
        },
        play_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '播放时间'
        }
    }, {
        tableName: 'play_records', // 明确指定表名为复数
        timestamps: false // 我们手动管理了 play_time，所以不需要 createdAt/updatedAt
    });

    return PlayRecord;
};