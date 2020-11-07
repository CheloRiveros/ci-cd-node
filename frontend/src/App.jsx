import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Layout } from "antd";
import "./App.scss";

import Chat from "./components/Chat";
import InstanceFooter from "./layout/InstanceFooter";
import SessionContextProvider from "./context/session/provider";

const { Header, Content } = Layout;

const App = () => {
  return (
    <div className="App">
      <SessionContextProvider>
        <Router>
          <Layout className="layout">
            <Header>g22-chat</Header>

            <Switch>
              <Route exact path="/">
                <Content>
                  <Chat />
                </Content>
              </Route>
            </Switch>

            <InstanceFooter />
          </Layout>
        </Router>
      </SessionContextProvider>
    </div>
  );
};

export default App;
