import express from "express"
import { body } from "express-validator"
import multer from "multer"
import {
  getAllProducts,
  getProductById,
  getProductByCode,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadExcel,
  updateStockFromExcel,
  getCategories,
  deleteAllProducts, // Importar nuevo controlador
} from "../controllers/productController.js"
import { authenticate, isAdmin } from "../middlewares/auth.js"
import { validate } from "../middlewares/validation.js"

const router = express.Router()

// Configurar multer para subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10485760, // 10MB para archivos grandes
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "text/csv" ||
      file.originalname.endsWith(".csv")
    ) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)"))
    }
  },
})

// Todas las rutas requieren autenticación
router.use(authenticate)

// Obtener todos los productos
router.get("/", getAllProducts)

// Obtener categorías
router.get("/categories", getCategories)

// Obtener producto por código
router.get("/code/:codigo", getProductByCode)

// Obtener producto por ID
router.get("/:id", getProductById)

// Crear producto (solo admin)
router.post(
  "/",
  isAdmin,
  [
    body("codigo").notEmpty().withMessage("El código es requerido"),
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    validate,
  ],
  createProduct,
)

// Actualizar producto (solo admin)
router.put(
  "/:id",
  isAdmin,
  [
    body("codigo").notEmpty().withMessage("El código es requerido"),
    body("nombre").notEmpty().withMessage("El nombre es requerido"),
    validate,
  ],
  updateProduct,
)

// Eliminar producto (solo admin)
router.delete("/:id", isAdmin, deleteProduct)

router.delete("/", isAdmin, deleteAllProducts)

router.post("/import", isAdmin, upload.single("file"), uploadExcel)

router.post("/update-stock", isAdmin, upload.single("file"), updateStockFromExcel)

export default router
