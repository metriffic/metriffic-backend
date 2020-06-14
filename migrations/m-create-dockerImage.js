'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DockerImages', {
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
      name: {
          allowNull: false,
          type: Sequelize.STRING
      },
      options: {
        allowNull: true,
        type: Sequelize.STRING
      },
      description: {
          allowNull: true,
          type: Sequelize.STRING
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('DockerImages');
  }
};
