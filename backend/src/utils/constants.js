const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
});

const USER_ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

module.exports = { TASK_STATUS, USER_ROLES };
