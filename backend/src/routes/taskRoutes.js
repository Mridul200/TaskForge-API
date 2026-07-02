const express = require('express');
const router = express.Router();
const {
  getTasks, getTaskById, createTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const authenticate = require('../middleware/auth');
const { taskValidation, idValidation, handleValidation } = require('../utils/validators');

router.use(authenticate);


/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: List tasks (own tasks for users, all tasks for admins)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Paginated list of tasks }
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Finish assignment }
 *               description: { type: string, example: Backend + frontend + docs }
 *               status: { type: string, enum: [pending, in_progress, completed] }
 *     responses:
 *       201: { description: Task created }
 */
router.get('/', getTasks);
router.post('/', taskValidation, handleValidation, createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by id
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task found }
 *       404: { description: Task not found }
 *   put:
 *     summary: Update a task (owner or admin only)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task updated }
 *       403: { description: Access denied }
 *   delete:
 *     summary: Delete a task (owner or admin only)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Task deleted }
 *       403: { description: Access denied }
 */
router.get('/:id', idValidation, handleValidation, getTaskById);
router.put('/:id', idValidation, taskValidation, handleValidation, updateTask);
router.delete('/:id', idValidation, handleValidation, deleteTask);

module.exports = router;

