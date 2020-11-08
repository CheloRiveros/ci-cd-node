module.exports = (sequelize, DataTypes) => {
  const ChatRoomMessage = sequelize.define(
    "ChatRoomMessage",
    {
      chatRoomId: DataTypes.INTEGER,
      author: DataTypes.STRING,
      message: DataTypes.TEXT,
    },
    {}
  );
  ChatRoomMessage.associate = (models) => {
    // associations can be defined here
    ChatRoomMessage.belongsTo(models.ChatRoom, {
      foreignKey: "chatRoomId",
      targetKey: "id",
    });
    ChatRoomMessage.belongsTo(models.User, {
      foreignKey: "userId",
      targetKey: "id",
    });
  };
  return ChatRoomMessage;
};
