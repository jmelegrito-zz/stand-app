'use strict';
module.exports = (sequelize, DataTypes) => {
  const group = sequelize.define('groups', {
    groupName: DataTypes.STRING
  }, {});
  groups.associate = function(models) {
    // associations can be defined here
    groups.hasMany(models.tasks, {
      as: 'tasks',
      foreignKey: 'projectID'
    })
  };
  return groups;
};