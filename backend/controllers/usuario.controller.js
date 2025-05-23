const { Usuario } = require("../models");

// Otros métodos CRUD aquí...

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
