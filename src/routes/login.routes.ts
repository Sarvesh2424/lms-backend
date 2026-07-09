import { Router } from "express";
import {
  loginInstructorController,
  loginLearnerController,
} from "../controllers/login.controller";

const router = Router();

router.post("/learner-login", loginLearnerController);
router.post("/instructor-login", loginInstructorController);

export default router;
