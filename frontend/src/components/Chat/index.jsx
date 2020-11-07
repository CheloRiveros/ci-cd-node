import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { message, Modal } from "antd";
import { FrownTwoTone } from "@ant-design/icons";
import _ from "lodash";

import api from "../../api";
import PickOrCreateRoom from "./PickOrCreateRoom";
import ChatBox from "./ChatBox";
import SessionContext from "../../context/session";

const Chat = () => {
  const location = useLocation();
  const history = useHistory();
  const [session, setSession] = React.useContext(SessionContext);
  const [room, setRoom] = React.useState();
  const [socket] = React.useState(io(process.env.REACT_APP_SOCKET_URL));
  const [socketInitialized, setSocketInitialized] = React.useState(false);
  const searchParams = new URLSearchParams(location.search);

  // Get session data from query string or redirect to Google Auth if not logged
  React.useEffect(() => {
    if (searchParams.has("token") && searchParams.has("username")) {
      setSession({
        token: searchParams.get("token"),
        username: searchParams.get("username"),
      });
      history.push(location.pathname);
    } else if (session === null) {
      window.location = `${process.env.REACT_APP_API_URL}/auth/google`;
    }
  }, [searchParams]);

  const createRoom = async (notFoundRoom) => {
    return api
      .authFetch("/chatrooms", {
        method: "POST",
        body: { name: notFoundRoom.name },
      })
      .then(() => socket.emit("join", notFoundRoom))
      .catch(() => message.error("There was an error"));
  };

  const connectToRoom = ({ selectedRoom }) => {
    selectedRoom.user = session.username;
    socket.emit("join", selectedRoom);
  };

  // Setup WebSocket
  React.useEffect(() => {
    if (!socketInitialized) {
      socket.on("roomJoined", (joinedRoom) => {
        setRoom(joinedRoom);
      });
      socket.on("roomNotFound", (notFoundRoom) => {
        Modal.confirm({
          title: "Room not found",
          icon: <FrownTwoTone />,
          content: `You can either try entering another room or create the room named "${notFoundRoom.name}"`,
          okText: "Create room",
          onOk: async () => {
            createRoom(notFoundRoom);
          },
          cancelText: "Cancel",
        });
      });
      setSocketInitialized(true);
    }
  }, [socket, createRoom]);

  if (_.isUndefined(room)) {
    return <PickOrCreateRoom handleFinish={connectToRoom} />;
  }
  return <ChatBox room={room} socket={socket} handleBack={() => setRoom()} />;
};

export default Chat;
