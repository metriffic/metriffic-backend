'use strict';
module.exports = (sequelize, DataTypes) => {
  const Platform = sequelize.define('Platform', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    spec: {
        type: DataTypes.STRING,
        allowNull: true
    },
  }, { timestamps: false });
  Platform.associate = function (models) {
    Platform.hasMany(models.Board)
  }
  return Platform;
};