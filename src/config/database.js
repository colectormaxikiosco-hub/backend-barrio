import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

// mysql2 maneja automáticamente el parsing de la URL de conexión
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("❌ Error: La variable de entorno DATABASE_URL no está definida.")
  console.error("💡 Sugerencia: Configura DATABASE_URL en tu archivo .env")
  process.exit(1)
}

// Crear pool de conexiones usando la URL directamente
const pool = mysql.createPool(databaseUrl)

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    console.log("🔄 Intentando conectar a MySQL...")
    const connection = await pool.getConnection()
    console.log("✅ Conexión a MySQL establecida correctamente")
    connection.release()
    return true
  } catch (error) {
    console.error("❌ Error al conectar a MySQL:") 
    console.error("   Mensaje:", error.message)
    console.error("   Código:", error.code)
    if (error.code === "ECONNREFUSED") {
      console.error("💡 Sugerencia: Verifica que MySQL esté corriendo y accesible")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("💡 Sugerencia: Verifica el usuario y contraseña en DATABASE_URL")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("💡 Sugerencia: La base de datos no existe, verifica el nombre en DATABASE_URL")
    }
    return false
  }
}

// Función para ejecutar queries
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error("❌ Error ejecutando query:", error.message)
    throw error
  }
}

// Función para transacciones
export const executeTransaction = async (queries) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const results = []
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params)
      results.push(result)
    }
    await connection.commit()
    return results
  } catch (error) {
    await connection.rollback()
    console.error("❌ Error en transacción:", error.message)
    throw error
  } finally {
    connection.release()
  }
}

export default pool
