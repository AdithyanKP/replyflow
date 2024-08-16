import vine from "@vinejs/vine";

const userRegisterSchema = vine.object({
  username: vine.string(),
  password: vine.string(),
});

const userLoginSchema = vine.object({
  username: vine.string(),
  password: vine.string(),
});

const createPostSchema = vine.object({
  content: vine.string(),
});

const createCommentSchema = vine.object({
  postId: vine.number(),
  text: vine.string(),
});

const addReplySchema = vine.object({
  text: vine.string(),
  commentId: vine.number(),
  postId: vine.number(),
});

export default {
  userRegisterSchema,
  userLoginSchema,
  createPostSchema,
  createCommentSchema,
  addReplySchema,
};
