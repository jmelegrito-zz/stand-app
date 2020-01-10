'use strict';
module.exports = (sequelize, DataTypes) => {
  const task = sequelize.define('tasks', {
    taskName: DataTypes.STRING,
    taskDetails: DataTypes.STRING,
    taskOwner: DataTypes.INTEGER,
    projectID: DataTypes.INTEGER
  }, {});
  tasks.associate = function(models) {
    // associations can be defined here
    tasks.belongsTo(models.users, {
      as: 'task',
      foreignKey: 'taskOwner'
    });
    tasks.belongsTo(models.groups, {
      as: 'task',
      foreignKey: 'projectID'
    })
  };
  return tasks;
};