const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Visita = sequelize.define(
  "Visita",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    visitante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    a_quien_visita: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    hora_ingreso: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    hora_salida: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    registrado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "visitas",
    timestamps: false,
  }
);

module.exports = Visita;
