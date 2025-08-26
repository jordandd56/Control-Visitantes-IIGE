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
      allowNull: true,
    },
    a_quien_visita: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    area_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_DATE"),
    },
    hora_ingreso: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    hora_salida: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    registrado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    observacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM("null", "ingreso", "salida"),
      allowNull: true,
      defaultValue: "ingreso",
      validate: {
        isIn: [["null", "ingreso", "salida"]],
      },
    },
  },
  {
    tableName: "visitas",
    timestamps: false,
  }
);

module.exports = Visita;
