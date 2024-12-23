'use strict';
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    datasetChunk: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },  { timestamps: false });
  Job.associate = function (models) {
    Job.belongsTo(models.Session,  { foreignKey: 'sessionId', as: 'session' });
    //Job.hasOne(models.Board, {foreignKey: 'boardId'});
  }
  return Job;
};
