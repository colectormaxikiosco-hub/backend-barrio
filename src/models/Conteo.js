import pool from "../config/database.js"

class Conteo {
  // Crear conteo
  static async create(conteoData) {
    const { plantilla_id, usuario_id } = conteoData

    const [result] = await pool.execute("INSERT INTO conteos (plantilla_id, usuario_id, estado) VALUES (?, ?, ?)", [
      plantilla_id,
      usuario_id,
      "en_progreso",
    ])

    const conteo_id = result.insertId

    // Copiar productos de la plantilla al conteo
    await pool.execute(
      `INSERT INTO conteo_productos (conteo_id, producto_id, cantidad_deseada, cantidad_sistema)
       SELECT ?, pp.producto_id, pp.cantidad_deseada, prod.stock_sistema
       FROM plantilla_productos pp
       INNER JOIN productos prod ON pp.producto_id = prod.id
       WHERE pp.plantilla_id = ?`,
      [conteo_id, plantilla_id],
    )

    return conteo_id
  }

  // Obtener todos los conteos
  static async findAll(filters = {}) {
    let query = `
      SELECT c.*, 
             p.nombre as plantilla_nombre,
             u.nombre as usuario_nombre,
             (SELECT COUNT(*) FROM conteo_productos WHERE conteo_id = c.id) as total_productos,
             (SELECT COUNT(*) FROM conteo_productos WHERE conteo_id = c.id AND cantidad_real IS NOT NULL) as productos_contados
      FROM conteos c
      INNER JOIN plantillas p ON c.plantilla_id = p.id
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE 1=1
    `
    const params = []

    if (filters.usuario_id) {
      query += " AND c.usuario_id = ?"
      params.push(filters.usuario_id)
    }

    if (filters.estado) {
      query += " AND c.estado = ?"
      params.push(filters.estado)
    }

    query += " ORDER BY c.fecha_inicio DESC"

    const [rows] = await pool.execute(query, params)
    return rows
  }

  // Obtener conteo por ID con sus productos
  static async findById(id) {
    const [conteos] = await pool.execute(
      `SELECT c.*, 
              p.nombre as plantilla_nombre,
              u.nombre as usuario_nombre
       FROM conteos c
       INNER JOIN plantillas p ON c.plantilla_id = p.id
       INNER JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = ?`,
      [id],
    )

    if (conteos.length === 0) return null

    const conteo = conteos[0]

    // Obtener productos del conteo
    const [productos] = await pool.execute(
      `SELECT cp.*, 
              prod.codigo, 
              prod.nombre, 
              prod.categoria,
              (cp.cantidad_deseada - COALESCE(cp.cantidad_real, 0)) as pedido,
              (COALESCE(cp.cantidad_real, 0) - cp.cantidad_sistema) as diferencia,
              CASE 
                WHEN COALESCE(cp.cantidad_real, 0) > cp.cantidad_sistema THEN COALESCE(cp.cantidad_real, 0) - cp.cantidad_sistema
                ELSE 0
              END as sobrante,
              CASE 
                WHEN COALESCE(cp.cantidad_real, 0) < cp.cantidad_sistema THEN cp.cantidad_sistema - COALESCE(cp.cantidad_real, 0)
                ELSE 0
              END as faltante
       FROM conteo_productos cp
       INNER JOIN productos prod ON cp.producto_id = prod.id
       WHERE cp.conteo_id = ?
       ORDER BY prod.nombre`,
      [id],
    )

    conteo.productos = productos
    return conteo
  }

  // Actualizar cantidad real de un producto en el conteo
  static async updateProductQuantity(conteo_id, producto_id, cantidad_real) {
    const [result] = await pool.execute(
      "UPDATE conteo_productos SET cantidad_real = ? WHERE conteo_id = ? AND producto_id = ?",
      [cantidad_real, conteo_id, producto_id],
    )

    return result.affectedRows > 0
  }

  // Finalizar conteo
  static async finalize(id) {
    const [result] = await pool.execute("UPDATE conteos SET estado = ?, fecha_fin = NOW() WHERE id = ?", [
      "finalizado",
      id,
    ])

    return result.affectedRows > 0
  }

  // Eliminar conteo
  static async delete(id) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Eliminar productos del conteo
      await connection.execute("DELETE FROM conteo_productos WHERE conteo_id = ?", [id])

      // Eliminar conteo
      await connection.execute("DELETE FROM conteos WHERE id = ?", [id])

      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // Obtener estadísticas de un conteo
  static async getStatistics(id) {
    const [stats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_productos,
         SUM(CASE WHEN cantidad_real IS NOT NULL THEN 1 ELSE 0 END) as productos_contados,
         SUM(CASE WHEN cantidad_real > cantidad_sistema THEN cantidad_real - cantidad_sistema ELSE 0 END) as total_sobrante,
         SUM(CASE WHEN cantidad_real < cantidad_sistema THEN cantidad_sistema - cantidad_real ELSE 0 END) as total_faltante,
         SUM(cantidad_deseada - COALESCE(cantidad_real, 0)) as total_pedido
       FROM conteo_productos
       WHERE conteo_id = ?`,
      [id],
    )

    return stats[0]
  }
}

export default Conteo
