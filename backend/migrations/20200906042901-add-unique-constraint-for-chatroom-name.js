module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint("ChatRooms", {
      fields: ["name"],
      type: "unique",
      name: "unique_name",
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint("ChatRooms", "unique_name");
  },
};
