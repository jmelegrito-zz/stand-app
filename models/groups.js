'use strict';
module.exports = (sequelize, DataTypes) => {
  const groups = sequelize.define('groups', {
    groupName: DataTypes.STRING,
    memberID: DataTypes.INTEGER
  }, {});
  groups.associate = function(models) {
    // associations can be defined here
  };
  return groups;
};