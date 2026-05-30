import { Router } from "express";
import { logoutLearnerController } from "../controllers/logout.controller";

const router = Router();

router.post("/logout-learner",logoutLearnerController)

export default router;
