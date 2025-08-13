module.exports = (sequelize, DataTypes) => {

    const PostComment = sequelize.define("PostComment", {

      id: {

        type: DataTypes.INTEGER,

        primaryKey: true,

        autoIncrement: true,

      },

      post_id: {

        type: DataTypes.INTEGER,

        allowNull: false,

      },

      user_id: {

        type: DataTypes.INTEGER,

        allowNull: false,

      },

      content: {

        type: DataTypes.TEXT,

        allowNull: false,

      }

    }, {

      tableName: 'post_comments',

      timestamps: true,

      createdAt: 'created_at',

      updatedAt: false, // 评论通常不更新，可以禁用 updatedAt

    });

    return PostComment;
};
