import { Router } from "express";
// ✅ Import the new middleware
import { auth, adminOrBuilderOnly } from "../middleware/auth.js";
import {
  createTask,
  listTasksForSite,
  listTasksForFloor,
  updateTaskStatus,
  deleteTask,
} from "../controllers/task.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(auth);

// GET routes are fine for all roles (they are already filtered by the controller)
router.get("/site/:siteId", listTasksForSite);
router.get("/site/:siteId/floor/:floorId", listTasksForFloor);

// ✅ Protect create and delete actions to admin and builder
router.post("/", adminOrBuilderOnly, upload.single('image'), createTask);
// Anyone logged in (workers, builders, admins) can update task status
router.patch("/:taskId/status", updateTaskStatus);
router.delete("/:id", adminOrBuilderOnly, deleteTask);

export default router;