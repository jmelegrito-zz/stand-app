'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    groupsID: DataTypes.INTEGER
  }, {freezeTableName: true});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};