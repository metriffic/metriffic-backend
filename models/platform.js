'use strict';
module.exports = (sequelize, DataTypes) => {
  const Platform = sequelize.define('Platform', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
  }, { timestamps: false });
  Platform.associate = function (models) {
    Platform.hasMany(models.Board)
    Platform.hasMany(models.DockerImage)
  }
  return Platform;
};
