'use strict';
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    dataset: {
        type: DataTypes.STRING, 
        allowNull: false,
    }
  },  { timestamps: false });
  Job.associate = function (models) {
    Job.belongsTo(models.Session,  { foreignKey: 'sessionId' });
    //Job.hasOne(models.Board, {foreignKey: 'boardId'});
  }
  return Job;
};