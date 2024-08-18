import request from "supertest";
import app from "../src/app"; // Adjust the path as needed
import { PrismaClient } from "@prisma/client";
import jest from "jest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "multi_level_secret";


describe("Auth Controller API - Register", () => {
    
  beforeAll(async () => {
    // Cleanup: Remove any existing test users to ensure a clean state
    await prisma.user.deleteMany({
      where: { username: { in: ["testuser2"] } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should register a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser2", password: "password1234" });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("username", "testuser2");

    // Verify that the password is hashed
    const user = await prisma.user.findUnique({
      where: { username: "testuser2" },
    });
    expect(user).not.toBeNull();
    expect(await bcrypt.compare("password1234", user.password)).toBe(true);
  });

  test("should return 400 if the user already exists", async () => {
    // Register the user for the first time
    await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser10", password: "password1234" });

    // Attempt to register the same user again
    const response = await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser10", password: "password1234" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "User already exists");
  });


  test("should log in with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body).toHaveProperty("token");

    // Verify JWT token
    const decoded = jwt.verify(response.body.token, JWT_SECRET);
    expect(decoded).toHaveProperty("id");
  });

  test("should return 400 for invalid username", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "invaliduser", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid username or password");
  });

  test("should return 400 for incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "wrongpassword" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Invalid username or password");
  });
});
