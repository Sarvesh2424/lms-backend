import { Router } from "express";
import loginRoutes from "./login.routes";
import registerRoutes from "./register.routes";
import learnerRoutes from "./learner.routes";
import logoutRoutes from "./logout.routes";
import uploadRoutes from "./upload.routes";
import instructorRoutes from "./instructor.routes";
const router = Router();

router.use("/login", loginRoutes);
router.use("/register", registerRoutes);
router.use("/learner", learnerRoutes);
router.use("/instructor", instructorRoutes);
router.use("/logout", logoutRoutes);
router.use("/upload", uploadRoutes);

export default router;
