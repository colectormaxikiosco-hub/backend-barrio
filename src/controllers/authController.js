import User from "../models/User.js"
import { generateToken } from "../config/jwt.js"

// Login
export const login = async (req, res, next) => {
  try {
    const { usuario, password } = req.body

    // Buscar usuario
    const user = await User.findByUsername(usuario)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      })
    }

    // Verificar contraseña
    const isValidPassword = await User.verifyPassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      })
    }

    // Generar token
    const token = generateToken({
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol,
    })

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          usuario: user.usuario,
          rol: user.rol,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// Cambiar contraseña
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    // Obtener usuario con contraseña
    const user = await User.findByUsername(req.user.usuario)

    // Verificar contraseña actual
    const isValidPassword = await User.verifyPassword(currentPassword, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      })
    }

    // Actualizar contraseña
    await User.updatePassword(userId, newPassword)

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    next(error)
  }
}
