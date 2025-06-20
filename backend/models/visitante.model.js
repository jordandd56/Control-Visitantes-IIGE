const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Visitante = sequelize.define(
  "Visitante",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    pasaporte: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "visitantes",
    timestamps: false,
  }
);

module.exports = Visitante;
