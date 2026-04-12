const express = require("express");
const router = express.Router();
const clientController = require("../controllers/client.controller");
const authenticateToken = require("../middleware/auth.middleware");

// All client routes are protected
router.use(authenticateToken);

router.get("/", clientController.getAllClients);
router.get("/:id", clientController.getClientById);
router.post("/", clientController.createClient);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

module.exports = router;
