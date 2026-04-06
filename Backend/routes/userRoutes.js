const express = require("express");
const router = express.Router();
const {
  getProfile, updateProfile, addRole, getAllUsers, deleteUser,
} = require("../controllers/userController");
const { protect, roleOnly } = require("../middleware/authMiddleware");

router.get("/profile",    protect, getProfile);
router.put("/profile",    protect, updateProfile);
router.put("/add-role",   protect, addRole);
router.get("/",           protect, roleOnly("admin"), getAllUsers);
router.delete("/:id",     protect, roleOnly("admin"), deleteUser);

module.exports = router;
