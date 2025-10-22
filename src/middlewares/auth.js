import { verifyToken } from "../config/jwt.js"

// Middleware para verificar autenticación
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      })
    }

    // Agregar información del usuario al request
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error de autenticación",
    })
  }
}

// Middleware para verificar rol de administrador
export const isAdmin = (req, res, next) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requiere rol de administrador",
    })
  }
  next()
}

// Middleware para verificar que el usuario accede a sus propios datos o es admin
export const isOwnerOrAdmin = (req, res, next) => {
  const userId = Number.parseInt(req.params.id)

  if (req.user.id !== userId && req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado",
    })
  }
  next()
}
