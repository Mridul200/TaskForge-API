const UserModel = require('../models/userModel');
const TaskModel = require('../models/taskModel');

async function getAllUsers(req, res, next) {
  try {
    const users = await UserModel.findAll();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { name, email, role } = req.body;
    const updated = await UserModel.update(req.params.id, { name, email, role });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const deleted = await UserModel.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await TaskModel.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, updateUser, deleteUser, getStats };
