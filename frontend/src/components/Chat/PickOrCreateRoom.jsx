import React from "react";
import PropTypes from "prop-types";
import { Button, Form, Input, Typography } from "antd";

const { Title } = Typography;

const PickOrCreateRoom = ({ handleFinish }) => {
  return (
    <div className="container" style={{ width: "400px", marginTop: "32px" }}>
      <Title style={{ textAlign: "center" }}>Pick a room</Title>

      <Form
        layout="vertical"
        style={{ display: "flex", flexDirection: "column" }}
        requiredMark={false}
        onFinish={handleFinish}
      >
        <Form.Item
          name={["selectedRoom", "name"]}
          label="Room name"
          rules={[{ required: true, message: "Please input a room name!" }]}
        >
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Enter room
        </Button>
      </Form>
    </div>
  );
};

PickOrCreateRoom.propTypes = {
  handleFinish: PropTypes.func.isRequired,
};

export default PickOrCreateRoom;
