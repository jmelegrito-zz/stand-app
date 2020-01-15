'use strict';
module.exports = (sequelize, DataTypes) => {
  const group = sequelize.define('group', {
    groupName: DataTypes.STRING
  }, {freezeTableName: true});
  group.associate = function(models) {
    // associations can be defined here
  };
  return group;
};