/* Controladores CRUD + login con bcrypt */
const { Usuario, Rol } = require("../models");
const { Op } = require("sequelize");

/* ---------- POST /api/usuarios/login ---------- */
exports.login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena)
    return res
      .status(400)
      .json({ message: "Usuario y contraseña son requeridos" });

  try {
    const user = await Usuario.findOne({ where: { usuario } });
    const credencialesInvalidas =
      !user || !(await user.validarContrasena(contrasena));

    if (credencialesInvalidas)
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });

    const { contrasena: _, ...userData } = user.toJSON();
    res.json({ message: "Inicio de sesión exitoso", usuario: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

/* ---------- POST /api/usuarios ---------- */
exports.agregarUsuario = async (req, res) => {
  const { nombre_completo, usuario, contrasena, rol_id } = req.body;

  if (!nombre_completo || !usuario || !contrasena || !rol_id)
    return res.status(400).json({ message: "Todos los campos son requeridos" });

  try {
    const existente = await Usuario.findOne({ where: { usuario } });
    if (existente)
      return res.status(409).json({ message: "Usuario ya existe" });

    /* El hook beforeCreate cifrará la contraseña */
    const nuevoUsuario = await Usuario.create({
      nombre_completo,
      usuario,
      contrasena,
      rol_id,
    });

    const { contrasena: _, ...userData } = nuevoUsuario.toJSON();
    res
      .status(201)
      .json({ message: "Usuario creado exitosamente", usuario: userData });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

/* ---------- GET /api/usuarios ---------- */
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["contrasena", "rol_id"] },
      include: [{ model: Rol, as: "rol", attributes: ["nombre"] }],
    });
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

/* ---------- GET /api/usuarios/buscar?nombre_completo=... ---------- */
exports.obtenerUsuariosPorNombre = async (req, res) => {
  const { nombre_completo } = req.query;

  if (!nombre_completo)
    return res
      .status(400)
      .json({ message: "El parámetro 'nombre_completo' es obligatorio" });

  try {
    const usuarios = await Usuario.findAll({
      where: { nombre_completo: { [Op.iLike]: `%${nombre_completo}%` } },
      attributes: { exclude: ["contrasena"] },
    });
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};

/* ---------- PUT /api/usuarios/:id/contrasena ---------- */
exports.actualizarContrasena = async (req, res) => {
  const { id } = req.params;
  const { nuevaContrasena, codigoVerificacion } = req.body;

  if (!nuevaContrasena)
    return res.status(400).json({ message: "La contraseña es obligatoria" });

  if (!codigoVerificacion)
    return res
      .status(400)
      .json({ message: "El código de verificación es obligatorio" });

  if (codigoVerificacion !== "Admin4568")
    return res
      .status(403)
      .json({ message: "Código de verificación incorrecto" });

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado" });

    usuario.contrasena = nuevaContrasena;
    await usuario.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error del servidor", error: error.message });
  }
};
