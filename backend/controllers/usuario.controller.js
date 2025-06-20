const { Usuario } = require("../models");
const { Op } = require("sequelize");

exports.login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son requeridos" });
  }

  try {
    // Buscar usuario por nombre de usuario

    const user = await Usuario.findOne({ where: { usuario } });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    if (user.contrasena !== contrasena) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const { contrasena: _, ...userData } = user.toJSON();
    res.json({ message: "Inicio de sesión exitoso", usuario: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

exports.agregarUsuario = async (req, res) => {
  const { nombre_completo, usuario, contrasena, rol_id } = req.body;

  if (!nombre_completo || !usuario || !contrasena || !rol_id) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    const existingUser = await Usuario.findOne({ where: { usuario } });
    if (existingUser) {
      return res.status(409).json({ message: "Usuario ya existe" });
    }

    const newUser = await Usuario.create({
      nombre_completo,
      usuario,
      contrasena,
      rol_id,
    });
    const { contrasena: _, ...userData } = newUser.toJSON();
    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", usuario: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["contrasena"] },
    });
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

exports.obtenerUsuariosPorNombre = async (req, res) => {
  const { nombre_completo } = req.query;

  try {
    if (!nombre_completo) {
      return res
        .status(400)
        .json({ message: "El parámetro 'nombre' es obligatorio" });
    }

    const usuarios = await Usuario.findAll({
      where: {
        nombre_completo: {
          [Op.iLike]: `%${nombre_completo}%`,
        },
      },
      attributes: { exclude: ["contrasena"] },
    });

    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};
