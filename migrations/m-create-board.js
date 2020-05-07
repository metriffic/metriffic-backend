'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Boards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      platformId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      hostname: {
          allowNull: false,
          type: Sequelize.STRING
      },
      spec: {
          allowNull: true,
          type: Sequelize.STRING
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Boards');
  }
};