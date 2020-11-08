const express = require("express");
const _ = require("lodash");

const models = require("../models");
const mailer = require("../utils/mailer");

const router = express.Router();

module.exports = function (io) {
  /* GET users listing. */
  router.get("/", async (req, res, next) => {
    const chatRooms = await models.ChatRoom.findAll();
    res.send(chatRooms);
  });

  /* POST chatroom */
  router.post("/", async (req, res, next) => {
    const { name } = req.body;
    console.log(req.body)
    const chatRoom = await models.ChatRoom.findOne({
      where: {
        name,
      },
    });

    if (chatRoom === null) {
      await models.ChatRoom.create({
        name,
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(409);
    }
  });

  /* DELETE chatroom */
  router.delete("/", async (req, res, next) => {
    const { name } = req.body;
    const chatRoom = await models.ChatRoom.findOne({
      where: {
        name,
      },
    });
    if (!chatRoom) {
      res.sendStatus(404);
    } else {
      await chatRoom.destroy();
      res.sendStatus(200);
    }
  });

  /* GET messages of chatroom */
  router.get("/:chatRoomName/messages/", async (req, res, next) => {
    const { chatRoomName } = req.params;
    const chatRoom = await models.ChatRoom.findOne({
      where: {
        name: chatRoomName,
      },
    });

    if (!chatRoom) {
      res.sendStatus(404);
    } else {
      const messages = await chatRoom.getMessages();
      res.send(messages);
    }
  });

  /* POST message to chatroom */
  router.post("/:chatRoomName/messages", async (req, res, next) => {
    const {
      body: { roomName, author, message },
    } = req;
    const chatRoom = await models.ChatRoom.findOne({
      where: {
        name: roomName,
      },
    });

    const { id: chatRoomId } = chatRoom;

    const splitted = message.split(" ");
    if (message === "/clear") {
      await chatRoom.setMessages([]);
      io.sockets.emit("clearMessages");
    } else if (
      splitted[0] === "/repeat" &&
      _.isNumber(splitted[1]) &&
      splitted[2]
    ) {
      const repeatMessage = splitted.slice(2).join(" ");
      for (let i = 0; i < splitted[1]; i += 1) {
        models.ChatRoomMessage.create({
          chatRoomId,
          author,
          message: repeatMessage,
        }).then((msg) => io.sockets.emit("newMessage", msg));
      }
    } else if (splitted[0] === "/reverse" && splitted[1]) {
      const reversedMessage = splitted
        .slice(1)
        .join(" ")
        .split("")
        .reverse()
        .join("");
      const msg = await models.ChatRoomMessage.create({
        chatRoomId,
        author,
        message: reversedMessage,
      });
      io.sockets.emit("newMessage", msg);
    } else {
      const msg = await models.ChatRoomMessage.create({
        chatRoomId,
        author,
        message,
      });
      // Handle mention
      if (message[0] === "@") {
        const mention = message.slice(1);
        const mentionUser = await models.User.findOne({
          where: {
            username: mention,
          },
        });
        if (mentionUser) {
          const targetEmail = mentionUser.email;
          mailer.sendMailNotification({
            targetEmail,
            username: mention,
            roomName,
          });
        }
      }
      io.sockets.emit("newMessage", msg);
    }
    res.send(202);
  });

  return router;
};
