import { Router } from "express";
import {
  createPost,
  createComment,
  addReply,
  getComments,
  getParentLevelComments,
} from "../controller/postController.js";
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
router.post(
  "/:postId/comments/:commentId/reply",
  authenticateToken,
  commentLimiter,
  addReply
);

router.get("/:postId/comments", authenticateToken, getComments);

router.get(
  "/:postId/comments/:commentId/expand",
  authenticateToken,
  getParentLevelComments
);

export default router;
