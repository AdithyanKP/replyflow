import { Router } from "express";
import { createPost, createComment } from "../controller/postController.js";
import { authenticateToken } from "../middleware/auth.js";
import { commentLimiter } from "../middleware/rateLimit.js";
const router = Router();

router.post("/create-post", authenticateToken, createPost);
router.post(
  "/:postId/comments",
  authenticateToken,
  commentLimiter,
  createComment
);

export default router;
