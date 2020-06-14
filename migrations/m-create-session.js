'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      max_jobs: {
        allowNull: true,
        default: 1,
        type: Sequelize.INTEGER
      },
      datasets: {
        allowNull: false,
        type: Sequelize.STRING
      },
      command: {
        allowNull: true,
        type: Sequelize.STRING
      },
      platformId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      dockerImageId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Sessions');
  }
};
