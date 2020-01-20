'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('task', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      taskName: {
        type: Sequelize.STRING
      },
      taskDetails: {
        type: Sequelize.STRING
      },
      taskStatus: {
        type: Sequelize.STRING
      },
      taskOwner: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "user"
          },
          key: "id"
        },
        onDelete: "cascade",
        onUpdate: "cascade"
      },
      projectID: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "group"
          },
          key: "id"
        },
        onDelete: "cascade",
        onUpdate: "cascade"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('task');
  }
};