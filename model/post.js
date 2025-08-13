// models/post.js
module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define("Post", { // 模型名建议用单数大写驼峰
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255), // 等同于 VARCHAR(255)
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      song_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }
    }, {
      tableName: 'posts',          // 明确指定表名
      timestamps: true,            // 启用 createdAt 和 updatedAt
      createdAt: 'created_at',     // 将 createdAt 映射到 created_at 列
      updatedAt: 'updated_at',     // 将 updatedAt 映射到 updated_at 列
    });

    return Post;

};