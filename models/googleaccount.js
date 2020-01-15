'use strict';
module.exports = (sequelize, DataTypes) => {
  const googleAccount = sequelize.define('googleAccount', {
    profileID: DataTypes.INTEGER
  }, {});
  googleAccount.associate = function(models) {
    // associations can be defined here
  };
  return googleAccount;
};