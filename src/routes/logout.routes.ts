import { Router } from "express";
import {
  logoutInstructorController,
  logoutLearnerController,
} from "../controllers/logout.controller";
import { loginInstructorController } from "../controllers/login.controller";

const router = Router();

router.post("/logout-learner", logoutLearnerController);
router.post("/logout-instructor", logoutInstructorController);

export default router;
