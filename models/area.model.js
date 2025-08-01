const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Area = sequelize.define(
  "Area",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "areas",
    timestamps: false,
  }
);

module.exports = Area;
