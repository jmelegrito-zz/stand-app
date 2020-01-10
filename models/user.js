'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('users', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    groupdID: DataTypes.INTEGER
  }, {});
  users.associate = function(models) {
    // associations can be defined here
    users.hasMany(models.tasks, {
      as: 'tasks',
      foreignKey: 'taskOwner'
    })
  };
  return users;
};