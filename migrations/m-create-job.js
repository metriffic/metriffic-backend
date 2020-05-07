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
      dataset: {
        allowNull: false,
        type: Sequelize.STRING
      },
      boardId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
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