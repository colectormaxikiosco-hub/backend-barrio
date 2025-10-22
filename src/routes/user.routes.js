import express from "express"
import { body } from "express-validator"
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/userController.js"
import { authenticate, isAdmin } from "../middlewares/auth.js"
import { validate } from "../middlewares/validation.js"

const router = express.Router()

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate, isAdmin)

// Obtener todos los usuarios
router.get("/", getAllUsers)

// Obtener usuario por ID
router.get("/:id", getUserById)

// Crear usuario
router.post(
  "/",
  [
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    body("usuario").notEmpty().withMessage("El usuario es requerido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("rol").isIn(["admin", "empleado"]).withMessage("El rol debe ser admin o empleado"),
    validate,
  ],
  createUser,
)

// Actualizar usuario
router.put(
  "/:id",
  [
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    body("usuario").notEmpty().withMessage("El usuario es requerido"),
    body("rol").isIn(["admin", "empleado"]).withMessage("El rol debe ser admin o empleado"),
    validate,
  ],
  updateUser,
)

// Eliminar usuario
router.delete("/:id", deleteUser)

export default router
