module.exports = (sequelize, DataTypes) => {
    const song_list = sequelize.define("song_list", {
      id: {
        type: DataTypes.INTEGER(10),
        primaryKey: true,
        autoIncrement: true,
      },
      // --- 这是你新增的字段 ---
      creator_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // 允许为空，因为系统歌单没有创建者
        comment: '创建者ID, 关联 consumers.id, NULL表示系统歌单'
      },
      type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'system', // 默认值为 'system'
        comment: '歌单类型: system, user_created'
      },
      // --- 新增字段结束 ---
      // title,pic,introduction,style
      title: {
        type: DataTypes.STRING(255),
        defaultValue: "",
      },
      pic: {
        type: DataTypes.STRING(255),
        defaultValue: "",
      },
      introduction: {
        type: DataTypes.STRING(255),
        defaultValue: "",
      },
      style: {
        type: DataTypes.STRING(255), //流行,摇滚,民谣,电子,古典,爵士,乡村,嘻哈,拉丁,轻音乐,另类/独立,金属,蓝调,雷鬼,世界音乐,拉丁,舞曲,乡村,民族,新世纪,后摇,R&B/Soul,电子乐,流行
      }
    });
    return song_list;
  };
  