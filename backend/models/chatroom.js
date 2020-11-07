module.exports = (sequelize, DataTypes) => {
  const ChatRoom = sequelize.define(
    "ChatRoom",
    {
      name: DataTypes.STRING,
    },
    {}
  );
  ChatRoom.associate = (models) => {
    // associations can be defined here
    ChatRoom.hasMany(models.ChatRoomMessage, {
      as: "Messages",
      foreignKey: "chatRoomId",
      sourceKey: "id",
    });
  };
  return ChatRoom;
};
