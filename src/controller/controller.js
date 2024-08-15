import { PrismaClient } from "@prisma/client";
import validateBody from "../validations/validationSchemas.js";
import moment from "moment";

const prisma = new PrismaClient();