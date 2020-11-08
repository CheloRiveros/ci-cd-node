const ioHandler = require("socket.io");
const models = require("../models");

module.exports = function (server) {
  const io = ioHandler(server);

  io.on("connection", (socket) => {
    socket.on("join", async (room) => {
      const chatRoom = await models.ChatRoom.findOne({
        where: {
          name: room.name,
        },
      });

      if (chatRoom !== null) {
        socket.join(room.name);
        socket.emit("roomJoined", room);
      } else {
        socket.emit("roomNotFound", room);
      }
    });
    socket.on("leave", async (room) => {
      const chatRoom = await models.ChatRoom.findOne({
        where: {
          name: room.name,
        },
      });

      if (chatRoom !== null) {
        socket.leave(room.name);
      }
    });
  });

  return io;
};
