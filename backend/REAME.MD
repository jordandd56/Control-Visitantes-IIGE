# 📋 Control de Visitantes - IIGE

Sistema de backend para el control y registro de visitantes en el Instituto de Investigación Geológico y Energético (IIGE), desarrollado con Node.js, Express y PostgreSQL.

---

## 📋 Índice

- [🚀 Requisitos Previos](#-requisitos-previos)
- [⚙️ Instalación](#️-instalación)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🛠️ Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [✅ Endpoints Disponibles](#-endpoints-disponibles)
- [🧪 Pruebas con Postman](#-pruebas-con-postman)
  - [Para probar el login](#para-probar-el-login)
  - [Para probar el registro de nuevo usuario](#para-probar-el-registro-de-nuevo-usuario)
- [💬 Contribuciones](#-contribuciones)
- [🆘 Soporte](#-soporte)
- [📌 Notas](#-notas)

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (recomendado: v16 o superior)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- [PostgreSQL](https://www.postgresql.org/)

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Control-Visitantes-IIGE.git
cd Control-Visitantes-IIGE/backend
```

### 2. Instalar dependencias

```bash
npm install
```

> Si lo prefieres, puedes instalar las dependencias principales manualmente:

```bash
npm install express sequelize pg pg-hstore body-parser cors dotenv
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido ajustado a tu configuración local:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=control_visitantes
DB_PORT=5432
PORT=3000
```

> Asegúrate de que la base de datos esté creada en PostgreSQL y las credenciales coincidan.

### 4. Ejecutar el proyecto

```bash
npm run dev
```

Esto iniciará el servidor en modo desarrollo usando `nodemon`. Por defecto, estará disponible en:

```
http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
backend/
├── config/            # Configuración de la base de datos (Sequelize)
├── controllers/       # Controladores de las rutas
├── models/            # Modelos Sequelize y relaciones
├── routes/            # Definición de rutas API
├── .env               # Variables de entorno
├── app.js             # Configuración principal de la app
├── package.json       # Dependencias y scripts
└── README.md          # Documentación
```

---

## 🛠️ Tecnologías Utilizadas

- **Node.js** – Entorno de ejecución para JavaScript
- **Express** – Framework para construir APIs REST
- **Sequelize** – ORM para PostgreSQL
- **PostgreSQL** – Sistema de base de datos relacional
- **dotenv** – Gestión de variables de entorno
- **CORS** – Middleware para habilitar peticiones externas
- **body-parser** – Middleware para analizar cuerpos de peticiones

---

## ✅ Endpoints Disponibles

| Método | Endpoint                | Descripción                             |
| ------ | ----------------------- | --------------------------------------- |
| POST   | `/api/usuarios/login`   | Iniciar sesión con usuario y contraseña |
| POST   | `/api/usuarios/agregar` | Registrar nuevo usuario                 |

> Más rutas serán añadidas conforme se avance el desarrollo del proyecto.

---

## 🧪 Pruebas con Postman

### Para probar el login

1. Abre Postman.
2. Selecciona el método `POST`.
3. URL: `http://localhost:3000/api/usuarios/login`
4. En el **body**, selecciona `raw` y formato `JSON`:

```json
{
  "usuario": "djsegovia",
  "contrasena": "1234"
}
```

---

### Para probar el registro de nuevo usuario

1. Abre Postman.
2. Selecciona el método `POST`.
3. URL: `http://localhost:3000/api/usuarios/agregar`
4. En el **body**, selecciona `raw` y formato `JSON`:

```json
{
  "nombre_completo": "Jose Muzo",
  "usuario": "muzoo",
  "contrasena": "1234",
  "rol_id": "1"
}
```

---

## 💬 Contribuciones

- Usa `issues` para reportar errores o sugerencias.

---

## 🆘 Soporte

Si tienes preguntas o problemas con la instalación, por favor abre un [issue en GitHub](https://github.com/users/jordandd56/projects/1).

---

## 📌 Notas

- La documentación se actualizará conforme se agreguen nuevas funcionalidades.
