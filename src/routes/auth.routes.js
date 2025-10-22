import express from "express"
import { body } from "express-validator"
import { login, getProfile, changePassword } from "../controllers/authController.js"
import { authenticate } from "../middlewares/auth.js"
import { validate } from "../middlewares/validation.js"

const router = express.Router()

// Login
router.post(
  "/login",
  [
    body("usuario").notEmpty().withMessage("El usuario es requerido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
    validate,
  ],
  login,
)

// Obtener perfil
router.get("/profile", authenticate, getProfile)

// Cambiar contraseña
router.post(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("La contraseña actual es requerida"),
    body("newPassword").isLength({ min: 6 }).withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
    validate,
  ],
  changePassword,
)

export default router
