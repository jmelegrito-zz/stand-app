'use strict';
module.exports = (sequelize, DataTypes) => {
  const task = sequelize.define('task', {
    taskName: DataTypes.STRING,
    taskDetails: DataTypes.STRING,
    taskStatus: DataTypes.STRING,
    taskOwner: DataTypes.INTEGER,
    projectID: DataTypes.INTEGER
  }, {freezeTableName: true});
  task.associate = function(models) {
    task.belongsTo(models.user, {
      foreignKey: "taskOwner"
    })
  };
  return task;
};