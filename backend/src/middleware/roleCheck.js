// Usage: router.delete('/:id', authenticate, authorize('admin'), handler)
// Pass multiple roles if more than one role should be allowed through.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
}

module.exports = authorize;
