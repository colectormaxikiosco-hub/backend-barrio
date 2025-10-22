import Conteo from "../models/Conteo.js"

// Obtener todos los conteos
export const getAllConteos = async (req, res, next) => {
  try {
    const { usuario_id, estado } = req.query
    const conteos = await Conteo.findAll({ usuario_id, estado })

    res.json({
      success: true,
      data: conteos,
    })
  } catch (error) {
    next(error)
  }
}

// Obtener conteo por ID
export const getConteoById = async (req, res, next) => {
  try {
    const { id } = req.params
    const conteo = await Conteo.findById(id)

    if (!conteo) {
      return res.status(404).json({
        success: false,
        message: "Conteo no encontrado",
      })
    }

    res.json({
      success: true,
      data: conteo,
    })
  } catch (error) {
    next(error)
  }
}

// Crear conteo
export const createConteo = async (req, res, next) => {
  try {
    const { plantilla_id } = req.body
    const usuario_id = req.user.id

    const conteoId = await Conteo.create({ plantilla_id, usuario_id })

    res.status(201).json({
      success: true,
      message: "Conteo iniciado exitosamente",
      data: { id: conteoId },
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar cantidad real de un producto
export const updateProductQuantity = async (req, res, next) => {
  try {
    const { id, producto_id } = req.params
    const { cantidad_real } = req.body

    const updated = await Conteo.updateProductQuantity(id, producto_id, cantidad_real)

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado en el conteo",
      })
    }

    res.json({
      success: true,
      message: "Cantidad actualizada exitosamente",
    })
  } catch (error) {
    next(error)
  }
}

// Finalizar conteo
export const finalizeConteo = async (req, res, next) => {
  try {
    const { id } = req.params

    const finalized = await Conteo.finalize(id)

    if (!finalized) {
      return res.status(404).json({
        success: false,
        message: "Conteo no encontrado",
      })
    }

    res.json({
      success: true,
      message: "Conteo finalizado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}

// Eliminar conteo
export const deleteConteo = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await Conteo.delete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Conteo no encontrado",
      })
    }

    res.json({
      success: true,
      message: "Conteo eliminado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}

// Obtener estadísticas de un conteo
export const getConteoStatistics = async (req, res, next) => {
  try {
    const { id } = req.params
    const stats = await Conteo.getStatistics(id)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}
