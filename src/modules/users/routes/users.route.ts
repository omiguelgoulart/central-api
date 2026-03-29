import { Router } from "express";

import { UserRepository } from "../repositories/users.repository";
import { UserService } from "../services/users.service";
import { UsersController } from "../controllers/users.controller";

const usersRouter = Router();

const repository = new UserRepository();
const service = new UserService(repository);
const controller = new UsersController(service);

usersRouter.post("/", (req, res) => controller.createUser(req, res));

usersRouter.get("/", (req, res) => controller.getAllUsers(res));

usersRouter.get("/:id", (req, res) => controller.getUserById(req, res));

usersRouter.delete("/:id", (req, res) => controller.deleteUser(req, res));

usersRouter.patch("/:id", (req, res) => controller.updateUser(req, res));

usersRouter.get("/count", (req, res) => controller.coutUsers(res));

usersRouter.get("/:id/details", (req, res) => controller.getUserWithDetails(req, res));

usersRouter.post("/verify-email", (req, res) => controller.verifyEmail(req.body.token));

usersRouter.patch("/:id/photo", (req, res) => controller.updatePhotoUrl(req.params.id, req.body.photoUrl));

usersRouter.patch("/:id/email-verified", (req, res) => controller.markEmailAsVerified(req.params.id));

export { usersRouter };

