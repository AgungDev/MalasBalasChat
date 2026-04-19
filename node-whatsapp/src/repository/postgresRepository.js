const { Pool } = require('pg');
const { normalizePhone, normalizeJid } = require('../utils/random');

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
        jid TEXT UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS jid TEXT UNIQUE;

      CREATE TABLE IF NOT EXISTS user_personas (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        persona_id INTEGER NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS ai_configs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
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

  async createAIConfig({ name, system_prompt }) {
    const existing = await this.getGlobalAIConfig();
    if (existing) {
      const config = await this.updateAIConfig(existing.id, { name, system_prompt });
      await this.pool.query('DELETE FROM ai_configs WHERE id <> $1', [existing.id]);
      return config;
    }

    const result = await this.pool.query(
      `INSERT INTO ai_configs (name, system_prompt) VALUES ($1, $2) RETURNING id, name, system_prompt, created_at, updated_at`,
      [name, system_prompt],
    );

    return result.rows[0];
  }

  async getAllAIConfigs() {
    const result = await this.pool.query(
      `SELECT id, name, system_prompt, created_at, updated_at FROM ai_configs ORDER BY id ASC`,
    );
    return result.rows;
  }

  async getAIConfigById(id) {
    const result = await this.pool.query(
      `SELECT id, name, system_prompt, created_at, updated_at FROM ai_configs WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async getGlobalAIConfig() {
    const result = await this.pool.query(
      `SELECT id, name, system_prompt, created_at, updated_at FROM ai_configs ORDER BY id ASC LIMIT 1`,
    );
    return result.rows[0] || null;
  }

  async updateAIConfig(id, { name, system_prompt }) {
    const result = await this.pool.query(
      `UPDATE ai_configs
       SET name = COALESCE(NULLIF($1, ''), name),
           system_prompt = COALESCE(NULLIF($2, ''), system_prompt),
           updated_at = now()
       WHERE id = $3
       RETURNING id, name, system_prompt, created_at, updated_at`,
      [name, system_prompt, id],
    );
    return result.rows[0] || null;
  }

  async deleteAIConfig(id) {
    const result = await this.pool.query(
      `DELETE FROM ai_configs WHERE id = $1 RETURNING id`,
      [id],
    );
    return result.rowCount > 0;
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

  async createUser({ phone, jid, name, role }) {
    const cleanedPhone = phone ? phone.replace(/[^0-9]/g, '') : null;
    const normalizedJid = normalizeJid(jid);
    const result = await this.pool.query(
      `INSERT INTO users (phone, jid, name, role) VALUES ($1, $2, $3, $4) RETURNING id, phone, jid, name, role, created_at, updated_at`,
      [cleanedPhone, normalizedJid, name, role],
    );
    return result.rows[0];
  }

  async getAllUsers() {
    const result = await this.pool.query(
      `SELECT id, phone, jid, name, role, created_at, updated_at FROM users ORDER BY id ASC`,
    );
    return result.rows;
  }

  async getUserByPhone(phone) {
    const cleanedPhone = normalizePhone(phone);
    const normalizedJid = phone && phone.includes('@') ? normalizeJid(phone) : null;
    const result = await this.pool.query(
      `SELECT id, phone, jid, name, role, created_at, updated_at FROM users
       WHERE (lower(jid) = $1 OR regexp_replace(phone, '[^0-9]', '', 'g') = $2)
       LIMIT 1`,
      [normalizedJid, cleanedPhone],
    );
    return result.rows[0] || null;
  }

  async updateUserJid(userId, jid) {
    const normalizedJid = normalizeJid(jid);
    const result = await this.pool.query(
      `UPDATE users
       SET jid = COALESCE(NULLIF($1, ''), jid), updated_at = now()
       WHERE id = $2
       RETURNING id, phone, jid, name, role, created_at, updated_at`,
      [normalizedJid, userId],
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
      `SELECT id, phone, jid, name, role, created_at, updated_at FROM users WHERE id = $1`,
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

  async getUserPersonaByPhone(phoneOrJid) {
    const cleanedPhone = normalizePhone(phoneOrJid);
    const normalizedJid = phoneOrJid && phoneOrJid.includes('@') ? normalizeJid(phoneOrJid) : null;
    const result = await this.pool.query(
      `
      SELECT
        u.id AS user_id,
        u.phone,
        u.jid,
        u.name AS user_name,
        u.role,
        p.id AS persona_id,
        p.name AS persona_name,
        p.system_prompt
      FROM users u
      JOIN user_personas up ON up.user_id = u.id
      JOIN personas p ON p.id = up.persona_id
      WHERE (
        regexp_replace(u.phone, '[^0-9]', '', 'g') = $1
        OR lower(u.jid) = $2
        OR regexp_replace(u.jid, '[^0-9]', '', 'g') = $1
      )
      LIMIT 1;
    `,
      [cleanedPhone, normalizedJid],
    );
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  }

  async getPersonaByName(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    const normalizedName = name.trim().toLowerCase();
    const result = await this.pool.query(
      `SELECT id, name, system_prompt FROM personas WHERE lower(name) = $1 LIMIT 1`,
      [normalizedName],
    );

    return result.rows[0] || null;
  }

  async getAIConfigByName(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    const normalizedName = name.trim().toLowerCase();
    const result = await this.pool.query(
      `SELECT id, name, system_prompt, created_at, updated_at FROM ai_configs WHERE lower(name) = $1 LIMIT 1`,
      [normalizedName],
    );
    return result.rows[0] || null;
  }

  async disconnect() {
    await this.pool.end();
  }
}

module.exports = PostgresRepository;
