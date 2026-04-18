const { Pool } = require('pg');

class PostgresRepository {
  constructor(config) {
    const connectionOptions = config.url
      ? { connectionString: config.url }
      : {
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          database: config.database,
        };

    this.pool = new Pool({
      ...connectionOptions,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  async connect() {
    this.client = await this.pool.connect();
    this.client.release();
  }

  async initializeSchema() {
    const sql = `
      CREATE TABLE IF NOT EXISTS personas (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_personas (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        persona_id INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    await this.pool.query(sql);
  }

  async createPersona({ name, system_prompt }) {
    const result = await this.pool.query(
      `INSERT INTO personas (name, system_prompt) VALUES ($1, $2) RETURNING *`,
      [name, system_prompt],
    );

    return result.rows[0];
  }

  async getAllPersonas() {
    const result = await this.pool.query(
      `SELECT id, name, system_prompt, created_at, updated_at FROM personas ORDER BY id ASC`,
    );
    return result.rows;
  }

  async getPersonaById(id) {
    const result = await this.pool.query(
      `SELECT id, name, system_prompt, created_at, updated_at FROM personas WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async updatePersona(id, { name, system_prompt }) {
    const result = await this.pool.query(
      `UPDATE personas
       SET name = COALESCE(NULLIF($1, ''), name),
           system_prompt = COALESCE(NULLIF($2, ''), system_prompt),
           updated_at = now()
       WHERE id = $3
       RETURNING id, name, system_prompt, created_at, updated_at`,
      [name, system_prompt, id],
    );
    return result.rows[0] || null;
  }

  async deletePersona(id) {
    const result = await this.pool.query(
      `DELETE FROM personas WHERE id = $1 RETURNING id`,
      [id],
    );
    return result.rowCount > 0;
  }

  async createUser({ phone, name, role }) {
    const cleanedPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
    const result = await this.pool.query(
      `INSERT INTO users (phone, name, role) VALUES ($1, $2, $3) RETURNING id, phone, name, role, created_at, updated_at`,
      [cleanedPhone, name, role],
    );
    return result.rows[0];
  }

  async getAllUsers() {
    const result = await this.pool.query(
      `SELECT id, phone, name, role, created_at, updated_at FROM users ORDER BY id ASC`,
    );
    return result.rows;
  }

  async getUserByPhone(phone) {
    const cleanedPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
    const result = await this.pool.query(
      `SELECT id, phone, name, role, created_at, updated_at FROM users WHERE regexp_replace(phone, '[^0-9]', '', 'g') = $1 LIMIT 1`,
      [cleanedPhone],
    );
    return result.rows[0] || null;
  }

  async updateUserByPhone(phone, { newPhone, name, role }) {
    const cleanedPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
    const cleanedNewPhone = newPhone ? newPhone.replace(/[^0-9]/g, '') : null;
    const result = await this.pool.query(
      `UPDATE users
       SET phone = COALESCE(NULLIF($1, ''), phone),
           name = COALESCE(NULLIF($2, ''), name),
           role = COALESCE(NULLIF($3, ''), role),
           updated_at = now()
       WHERE regexp_replace(phone, '[^0-9]', '', 'g') = $4
       RETURNING id, phone, name, role, created_at, updated_at`,
      [cleanedNewPhone, name, role, cleanedPhone],
    );
    return result.rows[0] || null;
  }

  async deleteUserByPhone(phone) {
    const cleanedPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
    const result = await this.pool.query(
      `DELETE FROM users WHERE regexp_replace(phone, '[^0-9]', '', 'g') = $1 RETURNING id`,
      [cleanedPhone],
    );
    return result.rowCount > 0;
  }

  async getUserById(id) {
    const result = await this.pool.query(
      `SELECT id, phone, name, role, created_at, updated_at FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async assignPersonaToUser(userId, personaId) {
    const result = await this.pool.query(
      `INSERT INTO user_personas (user_id, persona_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET persona_id = EXCLUDED.persona_id, updated_at = now()
       RETURNING user_id, persona_id`,
      [userId, personaId],
    );
    return result.rows[0] || null;
  }

  async removePersonaFromUser(userId) {
    const result = await this.pool.query(
      `DELETE FROM user_personas WHERE user_id = $1 RETURNING user_id`,
      [userId],
    );
    return result.rowCount > 0;
  }

  async getUserPersonaByPhone(phone) {
    const result = await this.pool.query(
      `
      SELECT
        u.id AS user_id,
        u.phone,
        u.name AS user_name,
        u.role,
        p.id AS persona_id,
        p.name AS persona_name,
        p.system_prompt
      FROM users u
      JOIN user_personas up ON up.user_id = u.id
      JOIN personas p ON p.id = up.persona_id
      WHERE regexp_replace(u.phone, '[^0-9]', '', 'g') = $1
      LIMIT 1;
    `,
      [phone],
    );
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  }

  async disconnect() {
    await this.pool.end();
  }
}

module.exports = PostgresRepository;
