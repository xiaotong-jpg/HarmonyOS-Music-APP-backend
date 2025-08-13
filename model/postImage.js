module.exports = (sequelize, DataTypes) => {
    const PostImage = sequelize.define("PostImage", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      order_index: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
      }
    }, {
      tableName: 'post_images',
      timestamps: false // 这个表通常不需要时间戳
    });

    PostImage.associate = function(models) {
        
    };

    return PostImage;
};