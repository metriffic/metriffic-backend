'use strict';
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maxJobs: {
        type: DataTypes.INTEGER,
        allowNull: true,
        default: 1
    },
    createdAt: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    datasetSplit: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    command: {
        type: DataTypes.STRING,
        allowNull: false,
    }
  },  { timestamps: false });
  Session.associate = function (models) {
    Session.hasMany(models.Job);
    Session.belongsTo(models.User, { foreignKey: 'userId' });
    Session.belongsTo(models.DockerImage, { foreignKey: 'dockerImageId' });
    Session.belongsTo(models.Platform, { foreignKey: 'platformId' });
  }
  return Session;
};
