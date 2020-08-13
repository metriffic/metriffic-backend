'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      state: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      dataset: {
        allowNull: false,
        type: Sequelize.STRING
      },
      sessionId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Jobs');
  }
};
