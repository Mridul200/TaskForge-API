const pool = require('../config/db');

const TaskModel = {
  // Admins see everything, normal users only see their own -> handled by
  // passing userId = null for admins in the controller.
  async findAll({ userId = null, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM tasks';
    const params = [];

    if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    const countQuery = userId
      ? 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?'
      : 'SELECT COUNT(*) as total FROM tasks';
    const countParams = userId ? [userId] : [];
    const [countRows] = await pool.query(countQuery, countParams);

    return { rows, total: countRows[0].total };
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ title, description, status, userId }) {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)',
      [title, description || null, status || 'pending', userId]
    );
    return this.findById(result.insertId);
  },

  async update(id, fields) {
    const allowed = ['title', 'description', 'status'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return this.findById(id);

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    values.push(id);

    await pool.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, values);
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getAdminStats() {
    const [userCountRows] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [taskCountRows] = await pool.query('SELECT COUNT(*) as totalTasks FROM tasks');
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM tasks GROUP BY status'
    );

    const stats = {
      totalUsers: userCountRows[0].totalUsers,
      totalTasks: taskCountRows[0].totalTasks,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
    };

    statusRows.forEach((row) => {
      if (row.status === 'pending') stats.pendingTasks = row.count;
      else if (row.status === 'in_progress') stats.inProgressTasks = row.count;
      else if (row.status === 'completed') stats.completedTasks = row.count;
    });

    return stats;
  },
};

module.exports = TaskModel;

