import { Router } from "express";
import { loginLearnerController } from "../controllers/login.controller";

const router = Router();

router.post("/learner-login", loginLearnerController);

export default router;
