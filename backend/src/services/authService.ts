import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import AppError from "../utils/AppError";
import hrUserRepository from "../repositories/hrUserRepository";

const toPublicUser = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (user: {
  id: string;
  name: string;
  email: string;
  role: string;
}) => {
  const signOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRY || "1d") as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    signOptions
  );
};

const register = async (name: string, email: string, password: string) => {
  if (!name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  if (password.trim().length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const existingUser = await hrUserRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError("User with this email already exist", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await hrUserRepository.create({
    name,
    email,
    passwordHash,
    role: "hr_admin",
  });

  return toPublicUser(user);
};

const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new AppError("Email and Password are required", 400);
  }

  const user = await hrUserRepository.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid Credentials", 401);
  }

  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
};

const getCurrentUser = async (userId: string) => {
  const user = await hrUserRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found", 401);
  }
  return user;
};

export default { register, login, getCurrentUser };
