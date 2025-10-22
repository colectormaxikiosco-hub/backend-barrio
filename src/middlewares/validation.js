import { validationResult } from "express-validator"

// Middleware para validar resultados de express-validator
export const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array(),
    })
  }

  next()
}
