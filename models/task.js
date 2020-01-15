'use strict';
module.exports = (sequelize, DataTypes) => {
  const task = sequelize.define('task', {
    taskName: DataTypes.STRING,
    taskDetails: DataTypes.STRING,
    taskOwner: DataTypes.INTEGER,
    projectID: DataTypes.INTEGER
  }, {freezeTableName: true});
  task.associate = function(models) {
    // associations can be defined here
  
  };
  return task;
};