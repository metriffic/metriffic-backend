'use strict';
module.exports = (sequelize, DataTypes) => {
  const DockerImage = sequelize.define('DockerImage', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    options: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
  }, { timestamps: false });
  DockerImage.associate = function (models) {
    DockerImage.belongsTo(models.Platform, { foreignKey: 'platformId' })
    DockerImage.belongsTo(models.User, { foreignKey: 'userId' })
  }
  return DockerImage;
};
