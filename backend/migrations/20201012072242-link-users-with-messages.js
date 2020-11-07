module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("ChatRoomMessages", "userId", {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("ChatRoomMessages", "userId");
  },
};
