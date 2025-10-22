import User from "../models/User.js"

// Obtener todos los usuarios
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll()

    res.json({
      success: true,
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

// Obtener usuario por ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

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

// Crear usuario
export const createUser = async (req, res, next) => {
  try {
    const { nombre, usuario, password, rol } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(usuario)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "El nombre de usuario ya está en uso",
      })
    }

    const userId = await User.create({ nombre, usuario, password, rol })

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: { id: userId },
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar usuario
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { nombre, usuario, rol, activo } = req.body

    const updated = await User.update(id, { nombre, usuario, rol, activo })

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}

// Eliminar usuario
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    // No permitir eliminar el propio usuario
    if (Number.parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminar tu propio usuario",
      })
    }

    const deleted = await User.delete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}
