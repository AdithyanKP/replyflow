import { PrismaClient } from "@prisma/client";
import validateBody from "../validations/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/constants.js";

const prisma = new PrismaClient();

export const userRegister = async (req, res) => {
  await validateBody(req.body, "userRegisterSchema");

  const { username, password } = req.body;

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  res
    .status(201)
    .json({ message: "User registered successfully", user: newUser });
};

export const userLogin = async (req, res) => {
  await validateBody(req.body, "userLoginSchema");
  const { username, password } = req.body;

  // Find the user by username
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // password check
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  // Create a JWT token
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

  res.json({ message: "Login successful", token });
};
