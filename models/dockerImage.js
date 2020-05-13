'use strict';
module.exports = (sequelize, DataTypes) => {
  const DockerImage = sequelize.define('DockerImage', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
  }, { timestamps: false });
  DockerImage.associate = function (models) {
    DockerImage.belongsTo(models.Platform, { foreignKey: 'platformId' })
  }
  return DockerImage;
};
