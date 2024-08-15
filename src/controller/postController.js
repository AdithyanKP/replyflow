import { PrismaClient } from "@prisma/client";
import validateBody from "../validations/index.js";
import moment from "moment";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const createPost = async (req, res) => {
  await validateBody(req.body, "createPostSchema");

  const { content } = req.body;
  const { id } = req.user;

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: id,
    },
  });

  res.status(201).json({ message: "Post created successfully", post: newPost });
};

export const createComment = async (req, res) => {
  await validateBody(req.body, "createCommentSchema");
  const { postId } = req.params;
  const { text } = req.body;

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: text,
        userId: req.user.id,
        postId: parseInt(postId),
      },
    });

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
