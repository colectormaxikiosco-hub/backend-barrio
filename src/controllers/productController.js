import Product from "../models/Product.js"
import xlsx from "xlsx"

// Obtener todos los productos
export const getAllProducts = async (req, res, next) => {
  try {
    const { categoria, search } = req.query
    const products = await Product.findAll({ categoria, search })

    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    next(error)
  }
}

// Obtener producto por ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

// Obtener producto por código
export const getProductByCode = async (req, res, next) => {
  try {
    const { codigo } = req.params
    const product = await Product.findByCode(codigo)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    next(error)
  }
}

// Crear producto
export const createProduct = async (req, res, next) => {
  try {
    const productData = req.body
    const productId = await Product.create(productData)

    // Obtener el producto completo recién creado
    const newProduct = await Product.findById(productId)

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: newProduct,
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar producto
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const productData = req.body

    const updated = await Product.update(id, productData)

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      })
    }

    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}

// Eliminar producto
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await Product.delete(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      })
    }

    res.json({
      success: true,
      message: "Producto eliminado exitosamente",
    })
  } catch (error) {
    next(error)
  }
}

// Cargar productos desde Excel
export const uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ningún archivo",
      })
    }

    // Leer archivo Excel/CSV
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El archivo está vacío",
      })
    }

    // Mapear datos del Excel al formato de la base de datos
    // Mapeo: Codigo -> codigo, Descripcion -> nombre, Rubro -> categoria, Stock -> stock_sistema
    const products = data.map((row) => ({
      codigo: String(row.Codigo || row.codigo || row.CODIGO || "").trim(),
      nombre: String(row.Descripcion || row.descripcion || row.DESCRIPCION || row.Nombre || row.nombre || "").trim(),
      categoria: String(row.Rubro || row.rubro || row.RUBRO || row.Categoria || row.categoria || "").trim(),
      stock_sistema: Number.parseInt(row.Stock || row.stock || row.STOCK || 0) || 0,
      precio: Number.parseFloat(row.Precio || row.precio || row.PRECIO || 0) || 0,
    }))

    // Validar que todos los productos tengan código y nombre
    const invalidProducts = products.filter((p) => !p.codigo || !p.nombre)
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${invalidProducts.length} productos no tienen código o nombre válido`,
      })
    }

    // Insertar/actualizar productos en la base de datos
    await Product.createBulk(products)

    res.json({
      success: true,
      message: `${products.length} productos cargados/actualizados exitosamente`,
      data: { total: products.length },
    })
  } catch (error) {
    next(error)
  }
}

// Actualizar solo el stock desde Excel
export const updateStockFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó ningún archivo",
      })
    }

    // Leer archivo Excel/CSV
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet)

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El archivo está vacío",
      })
    }

    // Mapear solo código y stock
    const stockUpdates = data.map((row) => ({
      codigo: String(row.Codigo || row.codigo || row.CODIGO || "").trim(),
      stock_sistema: Number.parseInt(row.Stock || row.stock || row.STOCK || 0) || 0,
    }))

    // Validar que todos tengan código
    const invalid = stockUpdates.filter((p) => !p.codigo)
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${invalid.length} filas no tienen código válido`,
      })
    }

    // Actualizar stock en la base de datos
    const updated = await Product.updateStockBulk(stockUpdates)

    res.json({
      success: true,
      message: `Stock actualizado para ${updated} productos`,
      data: { total: updated },
    })
  } catch (error) {
    next(error)
  }
}

// Obtener categorías
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.getCategories()

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    next(error)
  }
}

// Eliminar todos los productos
export const deleteAllProducts = async (req, res, next) => {
  try {
    const deleted = await Product.deleteAll()

    res.json({
      success: true,
      message: `${deleted} productos eliminados exitosamente`,
      data: { deleted },
    })
  } catch (error) {
    next(error)
  }
}
