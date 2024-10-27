'use strict';
module.exports = (sequelize, DataTypes) => {
  const Board = sequelize.define('Board', {
    hostname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
  }, { timestamps: false });
  Board.associate = function (models) {
    Board.belongsTo(models.Platform, { foreignKey: 'platformId' })
  }
  return Board;
};
