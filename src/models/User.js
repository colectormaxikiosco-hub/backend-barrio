import pool from "../config/database.js"
import bcrypt from "bcryptjs"

class User {
  // Crear usuario
  static async create(userData) {
    const { nombre, usuario, password, rol } = userData
    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await pool.execute("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)", [
      nombre,
      usuario,
      hashedPassword,
      rol || "empleado",
    ])

    return result.insertId
  }

  // Obtener todos los usuarios
  static async findAll() {
    const [rows] = await pool.execute(
      "SELECT id, nombre, usuario, rol, activo, fecha_creacion FROM usuarios ORDER BY fecha_creacion DESC",
    )
    return rows
  }

  // Obtener usuario por ID
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, nombre, usuario, rol, activo, fecha_creacion FROM usuarios WHERE id = ?",
      [id],
    )
    return rows[0]
  }

  // Obtener usuario por nombre de usuario (para login)
  static async findByUsername(usuario) {
    const [rows] = await pool.execute("SELECT * FROM usuarios WHERE usuario = ? AND activo = 1", [usuario])
    return rows[0]
  }

  // Actualizar usuario
  static async update(id, userData) {
    const { nombre, usuario, rol, activo } = userData

    const [result] = await pool.execute(
      "UPDATE usuarios SET nombre = ?, usuario = ?, rol = ?, activo = ? WHERE id = ?",
      [nombre, usuario, rol, activo, id],
    )

    return result.affectedRows > 0
  }

  // Actualizar contraseña
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const [result] = await pool.execute("UPDATE usuarios SET password = ? WHERE id = ?", [hashedPassword, id])

    return result.affectedRows > 0
  }

  // Eliminar usuario (soft delete)
  static async delete(id) {
    const [result] = await pool.execute("UPDATE usuarios SET activo = 0 WHERE id = ?", [id])

    return result.affectedRows > 0
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }
}

export default User
