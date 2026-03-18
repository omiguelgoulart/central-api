import { Router } from "express";
import { UsersController } from "../controllers/users.controller";

const router = Router();
const usersController = new UsersController();

router.post("/", (req, res) => usersController.createUser(req, res));

router.get("/", (req, res) => usersController.getAllUsers(res));

router.get("/:id", (req, res) => usersController.getUserById(req, res));

router.delete("/:id", (req, res) => usersController.deleteUser(req, res));

router.patch("/:id", (req, res) => usersController.updateUser(req, res));

router.get("/count", (req, res) => usersController.coutUsers(res));

router.get("/:id/details", (req, res) => usersController.getUserWithDetails(req, res));

router.post("/verify-email", (req, res) => usersController.verifyEmail(req.body.token));

router.patch("/:id/photo", (req, res) => usersController.updatePhotoUrl(req.params.id, req.body.photoUrl));

router.patch("/:id/email-verified", (req, res) => usersController.markEmailAsVerified(req.params.id));

export default router;

