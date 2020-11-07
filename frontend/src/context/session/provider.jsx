import React from "react";
import PropTypes from "prop-types";
import SessionContext from ".";

const SessionContextProvider = ({ children }) => {
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    if (session !== null) {
      window.localStorage.setItem("token", session.token);
    }
  }, [session]);

  return (
    <SessionContext.Provider value={[session, setSession]}>
      {children}
    </SessionContext.Provider>
  );
};

SessionContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SessionContextProvider;
