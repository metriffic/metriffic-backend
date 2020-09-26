'use strict';
 
const Roles = {
  USER  : 'USER',
  ADMIN : 'ADMIN',
};

const States = {
  LOGGEDIN  : 'LOGGEDIN',
  LOGGEDOUT : 'LOGGEDOUT',
};

module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastLoggedInAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    currentState: {
      type: DataTypes.STRING,
      allowNull: false
    },
}, { timestamps: false });
  User.associate = function (models) {
    User.hasMany(models.Session);
  }
  return User;
};

module.exports.Roles = Roles;
module.exports.States = States;