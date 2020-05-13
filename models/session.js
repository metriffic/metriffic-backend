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
    max_jobs: {
        type: DataTypes.STRING,
        allowNull: true,
        default: 1
    },
    datasets: {
        type: DataTypes.STRING, // json string
        allowNull: false,
    },
    command: {
        type: DataTypes.STRING, // json string
        allowNull: false,
    }
  },  { timestamps: false });
  Session.associate = function (models) {
    Session.hasMany(models.Job);
    Session.belongsTo(models.DockerImage, { foreignKey: 'dockerImageId' });
    Session.belongsTo(models.Platform, { foreignKey: 'platformId' });
  }
  return Session;
};
