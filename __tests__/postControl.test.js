import request from "supertest";
import app from "../src/app"; // Adjust the path as needed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Post Controller API", () => {
  let authToken;
  let postId = 4;
  let commentId;
  let userId;
  let replyId;

  beforeAll(async () => {
    // Register the user
    await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser6", password: "testpass6" });

    // Login the user to get the auth token
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser6", password: "testpass6" });

    console.log("response", response.body.token);
    authToken = response.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
  console.log("authToken1", authToken);
  test("should create a post", async () => {
    // Send request to create a post
    const response = await request(app)
      .post("/api/posts/create-post")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ content: "This is a test post" });

    // Check the response
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Post created successfully");
    expect(response.body.post).toHaveProperty("id");
    expect(response.body.post).toHaveProperty("userId");
    expect(response.body.post.content).toBe("This is a test post");
    postId = response.body.post.id;
  });

  test("should create a comment", async () => {
    // Send request to create a comment
    const response = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ text: "nice", postId });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Comment created successfully");
    expect(response.body.comment).toHaveProperty("id");
    expect(response.body.comment).toHaveProperty("userId");
    expect(response.body.comment).toHaveProperty("postId", postId);
    expect(response.body.comment.content).toBe("nice");

    commentId = response.body.comment.id;
  });

  test("should add a reply to a comment", async () => {
    // Send request to add a reply
    const response = await request(app)
      .post(`/api/posts/${postId}/comments/${commentId}/reply`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ text: "second reply", postId, commentId });

    // Check the response
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Reply created successfully");
    expect(response.body.reply).toHaveProperty("id");
    expect(response.body.reply).toHaveProperty("userId");
    expect(response.body.reply).toHaveProperty("postId", postId);
    expect(response.body.reply).toHaveProperty("parentCommentId", commentId);
    expect(response.body.reply.content).toBe("second reply");

    replyId = response.body.reply.id;
  });

  test("should retrieve comments with sorting options", async () => {
    const response = await request(app)
      .get(`/api/posts/${postId}/comments?sortBy=repliesCount&sortOrder=desc`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    // Check that the response is an array
    expect(Array.isArray(response.body)).toBe(true);

    // Check that the first comment has the expected properties
    const comment = response.body[0];
    expect(comment).toHaveProperty("id");
    expect(comment).toHaveProperty("text");
    expect(comment).toHaveProperty("createdAt");
    expect(comment).toHaveProperty("postId", postId.toString());
    expect(comment).toHaveProperty("parentCommentId", null);
    expect(comment).toHaveProperty("replies_count");

    // Check that replies is an array if it exists
    if (comment.replies) {
      expect(Array.isArray(comment.replies)).toBe(true);
      if (comment.replies.length > 0) {
        const reply = comment.replies[0];
        expect(reply).toHaveProperty("id");
        expect(reply).toHaveProperty("text");
        expect(reply).toHaveProperty("created_at");
      }
    }
  });

  test("should return 404 for a non-existent post", async () => {
    const response = await request(app)
      .get(`/api/posts/9999/comments`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Post not found");
  });

  test("should return 400 for invalid sorting parameters", async () => {
    const response = await request(app)
      .get(
        `/api/posts/${postId}/comments?sortBy=invalidField&sortOrder=invalidOrder`
      )
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid sorting parameters");
  });

  test("should retrieve parent level comments with pagination", async () => {
    const response = await request(app)
      .get(
        `/api/posts/${postId}/comments/${commentId}/expand?page=1&pageSize=10`
      )
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    // Check that the response is an array
    expect(Array.isArray(response.body)).toBe(true);

    // Check that the first comment has the expected properties
    const comment = response.body[0];
    expect(comment).toHaveProperty("id", commentId.toString());
    expect(comment).toHaveProperty("text");
    expect(comment).toHaveProperty("createdAt");
    expect(comment).toHaveProperty("postId", postId.toString());
    expect(comment).toHaveProperty("parentCommentId", null);
    expect(comment).toHaveProperty("replies");
    expect(comment).toHaveProperty("totalReplies");

    // Check that replies is an array
    expect(Array.isArray(comment.replies)).toBe(true);
    expect(comment.replies.length).toBeGreaterThanOrEqual(1);

    const reply = comment.replies[0];
    expect(reply).toHaveProperty("id");
    expect(reply).toHaveProperty("text");
    expect(reply).toHaveProperty("createdAt");
  });

  test("should return 404 for a non-existent post", async () => {
    const response = await request(app)
      .get(`/api/posts/9999/comments/${commentId}/expand?page=1&pageSize=10`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Post not found");
  });

  test("should return 404 for a non-existent comment", async () => {
    const response = await request(app)
      .get(`/api/posts/${postId}/comments/9999/expand?page=1&pageSize=10`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Comment not found");
  });

  test("should return 400 for invalid pagination parameters", async () => {
    const response = await request(app)
      .get(
        `/api/posts/${postId}/comments/${commentId}/expand?page=invalid&pageSize=10`
      )
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "page and pageSize must be numbers"
    );
  });
});
