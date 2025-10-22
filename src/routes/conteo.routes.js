import express from "express"
import { body } from "express-validator"
import {
  getAllConteos,
  getConteoById,
  createConteo,
  updateProductQuantity,
  finalizeConteo,
  deleteConteo,
  getConteoStatistics,
} from "../controllers/conteoController.js"
import { authenticate } from "../middlewares/auth.js"
import { validate } from "../middlewares/validation.js"

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Obtener todos los conteos
router.get("/", getAllConteos)

// Obtener conteo por ID
router.get("/:id", getConteoById)

// Obtener estadísticas de un conteo
router.get("/:id/estadisticas", getConteoStatistics)

// Crear conteo
router.post(
  "/",
  [body("plantilla_id").isInt().withMessage("El ID de la plantilla es requerido"), validate],
  createConteo,
)

// Actualizar cantidad real de un producto
router.put(
  "/:id/productos/:producto_id",
  [body("cantidad_real").isInt({ min: 0 }).withMessage("La cantidad real debe ser un número positivo"), validate],
  updateProductQuantity,
)

router.put("/:id/finalizar", finalizeConteo)

// Eliminar conteo
router.delete("/:id", deleteConteo)

export default router
