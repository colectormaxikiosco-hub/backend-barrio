// Middleware para manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error("\n━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.error("❌ ERROR CAPTURADO EN ERROR HANDLER")
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.error("Timestamp:", new Date().toISOString())
  console.error("Ruta:", req.path)
  console.error("Método:", req.method)
  console.error("Body:", JSON.stringify(req.body, null, 2))
  console.error("Error:", err.message)
  console.error("Stack:", err.stack)
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors: err.errors,
    })
  }

  // Error de base de datos
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "El registro ya existe",
    })
  }

  if (err.code === "ER_NO_SUCH_TABLE") {
    return res.status(500).json({
      success: false,
      message: "Error de base de datos: tabla no encontrada",
    })
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(500).json({
      success: false,
      message: "Error de conexión a la base de datos",
    })
  }

  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  })
}

// Middleware para rutas no encontradas
export const notFound = (req, res) => {
  console.log(`⚠️  Ruta no encontrada: ${req.method} ${req.path}`)
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  })
}
