// user-service.js
const { UserBase } = require("../Models/base-model");
const bcrypt = require("bcrypt");
const TokenService = require("../Service/token-service");
const uuid = require("uuid");

class UserService {
  async registration(firstName, lastName, email, password) {
    try {
      const user = await UserBase.findOne({ where: { userEmail: email } });

      if (user != null) {
        throw new Error("Email already taken or invalid");
      }

      const UserId = uuid.v4();

      const hashedPassword = await bcrypt.hash(password, 10);

      const token = await TokenService.generateToken({ email, password });

      if (!token) {
        throw new Error("Failed to generate token");
      }

      await UserBase.create({
        userId: UserId,
        lastName: lastName,
        userName: firstName,
        userEmail: email,
        userPassword: hashedPassword,
        refreshToken: token.refreshToken,
      });

      return { token, UserId };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Registration error", error);
    }
  }

  async login(email, password) {
    try {
      const user = await UserBase.findOne({ where: { userEmail: email } });

      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await bcrypt.compare(password, user.userPassword);

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = await TokenService.generateToken({ email, password });

      await TokenService.saveToken(email, token.refreshToken);

      return { token, userId: user.userId };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login error", error);
    }
  }

  async logout(refreshToken) {
    try {
      const token = await TokenService.removeToken(refreshToken);

      return { token };
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout error", error);
    }
  }

  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token not found");
      }

      const userToken = TokenService.validateToken(
        refreshToken,
        process.env.JWT_REFRASH_KEY
      );

      const tokenFromDb = await UserBase.findOne({
        where: { refreshToken: refreshToken },
      });

      if (!userToken || tokenFromDb.expirationDate < new Date()) {
        throw new Error("Token is invalid or expired");
      }

      const tokens = await TokenService.generateToken({
        email: tokenFromDb.userEmail,
        password: tokenFromDb.userPassword,
      });

      return { tokens, userId: tokenFromDb.userId };
    } catch (error) {
      console.error("Refresh error:", error);
      throw new Error("Refresh error", error);
    }
  }

  async getAllUsers() {
    try {
      const users = await UserBase.findAll();

      return { users };
    } catch (error) {
      console.error("Get users error:", error);
      throw new Error("Get users error", error);
    }
  }
}

module.exports = new UserService();
