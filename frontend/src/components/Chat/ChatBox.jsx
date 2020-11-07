import React, { useEffect } from "react";
import PropType from "prop-types";
import { PageHeader, Input, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import _ from "lodash";
import moment from "moment";
import { animateScroll } from "react-scroll";

import api from "../../api";

const { Search } = Input;
const { Text } = Typography;
const DATE_FORMAT = "DD/MM/YYYY - HH:mm";

const ChatBox = ({ room, socket, handleBack }) => {
  const [messages, setMessages] = React.useState([]);
  const [inputMessage, setInputMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sendLoading, setSendLoading] = React.useState(false);

  React.useEffect(() => {
    api
      .authFetch(`/chatrooms/${room.name}/messages`)
      .then(async (response) => response.json())
      .then((messagesData) => {
        setMessages(messagesData);
        setLoading(false);
      });

    const cleanup = () => {
      socket.off("newMessage");
      socket.off("newMessage");
      socket.emit("leave", room);
    };
    return cleanup;
  }, [room]);

  React.useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "scroll-chat",
    });
  }, [messages]);

  useEffect(() => {
    socket.on("newMessage", (message) => {
      console.log(message);
      setMessages([...messages, message]);
    });

    socket.on("clearMessages", () => {
      setMessages([]);
    });

    const cleanup = () => {
      socket.off("newMessage");
      socket.off("clearMessages");
      socket.emit("leave", room);
    };
    return cleanup;
  }, [socket, messages]);

  const sendMessage = (message) => {
    const trimmedMessage = _.trim(message);
    if (_.isEmpty(trimmedMessage)) return;

    setSendLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/chatrooms/${room.name}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: room.name,
        author: room.user,
        message: trimmedMessage,
      }),
    }).then(() => {
      setInputMessage("");
      setSendLoading(false);
    });
  };

  return (
    <div id="chat-box">
      <PageHeader
        onBack={handleBack}
        title={room.name}
        subTitle={<Text type="secondary">logged as {room.user}</Text>}
      />
      <div className="chat-messages" id="scroll-chat">
        {messages.map((m) => {
          const isAuthor = m.author === room.user;

          return (
            <div
              key={m.id}
              className={isAuthor ? "is-author" : "is-not-author"}
            >
              <div className="message">
                <p>{m.message}</p>
                <span>
                  {m.author} -{moment(m.createdAt).format(DATE_FORMAT)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-send-message">
        <Search
          onChange={(e) => setInputMessage(e.target.value)}
          value={inputMessage}
          className="send-message"
          placeholder="Escribe tu mensaje aqui"
          enterButton={<SendOutlined />}
          size="middle"
          onSearch={sendMessage}
          loading={sendLoading || loading}
        />
      </div>
    </div>
  );
};

ChatBox.propTypes = {
  room: PropType.shape({
    user: PropType.string,
    name: PropType.string,
  }).isRequired,
  socket: PropType.shape({
    on: PropType.func,
    off: PropType.func,
    emit: PropType.func,
  }).isRequired,
  handleBack: PropType.func.isRequired,
};

export default ChatBox;
