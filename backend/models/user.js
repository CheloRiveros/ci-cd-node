module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      token: DataTypes.STRING,
    },
    {}
  );
  User.associate = (models) => {
    // associations can be defined here
    User.hasMany(models.ChatRoomMessage, {
      as: "Messages",
      foreignKey: "userId",
      sourceKey: "id",
    });
  };
  return User;
};
