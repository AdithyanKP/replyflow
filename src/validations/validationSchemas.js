import vine from "@vinejs/vine";

const userRegisterSchema = vine.object({
  username: vine.string(),
  password: vine.string(),
});

const userLoginSchema = vine.object({
  username: vine.string(),
  password: vine.string(),
});

export default {
  userRegisterSchema,
  userLoginSchema,
};
