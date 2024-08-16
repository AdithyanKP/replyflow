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

  const { text, postId } = req.body;

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

export const addReply = async (req, res) => {
  await validateBody(req.body, "addReplySchema");

  const { text, postId, commentId } = req.body;

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: "comment not found" });
    }

    // Create reply
    const reply = await prisma.comment.create({
      data: {
        content: text,
        userId: req.user.id,
        postId: parseInt(postId),
        parentCommentId: commentId,
      },
    });

    res.status(201).json({ message: "Reply created successfully", reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const { sortBy = "createdAt", sortOrder = "desc" } = req.query;

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    //validation
    const validSortFields = ["createdAt", "repliesCount"];
    const validSortOrders = ["asc", "desc"];
    if (
      !validSortFields.includes(sortBy) ||
      !validSortOrders.includes(sortOrder)
    ) {
      return res.status(400).json({ error: "Invalid sorting parameters" });
    }

    const sortFieldMap = {
      createdAt: '"createdAt"',
      repliesCount: "replies_count",
    };
    const sortField = sortFieldMap[sortBy];
    const order = sortOrder.toUpperCase();

    const comments = await prisma.$queryRawUnsafe(
      `
          SELECT 
              c.id, 
              c.content as text, 
              c."createdAt" as "createdAt",
              c."postId" as "postId", 
              c."parentCommentId" as "parentCommentId",
              (SELECT COUNT(*) FROM comment WHERE "parentCommentId" = c.id) as replies_count,
              (SELECT json_agg(json_build_object('id', r.id, 'text', r.content, 'created_at', r."createdAt"))
                  FROM (
                      SELECT id, content, "createdAt"
                      FROM "comment" r
                      WHERE r."parentCommentId" = c.id
                      ORDER BY r."createdAt" DESC
                      LIMIT 2
                  ) as r
              ) as replies
          FROM "comment" c
          WHERE c."postId" = $1 AND c."parentCommentId" IS NULL
          ORDER BY ${sortField} ${order}
      `,
      parseInt(postId)
    );

    // Convert BigInt fields to String
    const result = comments.map((comment) => ({
      ...comment,
      id: comment.id.toString(),
      postId: comment.postId.toString(),
      parentCommentId: comment.parentCommentId
        ? comment.parentCommentId.toString()
        : null,
      replies_count: comment.replies_count.toString(),
      replies: comment.replies
        ? comment.replies.map((reply) => ({
            ...reply,
            id: reply.id.toString(),
          }))
        : [],
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
