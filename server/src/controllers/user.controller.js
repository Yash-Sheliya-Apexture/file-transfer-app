// server/src/controllers/user.controller.js
exports.getProfile = (req, res) => {
  res.json(req.user);
};