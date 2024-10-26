const UserService = require("../Service/user-service");
const { UserBase } = require("../Models/base-model");
const session = require("express-session");

class UserController {
  async registration(req, res, next) {
    try {
      const { firstName, lastName, email, password } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).send({ error: "All fields are required" });
      }

      const userData = await UserService.registration(
        firstName,
        lastName,
        email,
        password
      );
      req.session.userId = userData.userId;
      req.session.refreshToken = userData.token.refreshToken;
      req.session.accessToken = userData.token.accessToken;

      console.log("Сессия клиента в регистрации:", req.session);

      return res.json(userData);
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      console.log(email, password);

      if (!email || !password) {
        return res.status(400).send({ error: "All fields are required" });
      }

      const userData = await UserService.login(email, password);

      if (!userData || !userData.userId) {
        return res.status(401).send({ error: "Invalid credentials" });
      }

      req.session.userId = userData.userId;
      req.session.refreshToken = userData.token.refreshToken;
      req.session.accessToken = userData.token.accessToken;

      console.log("Сессия клиента во входе:", req.session.userId);

      return res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      req.session.destroy();

      return res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.session;

      if (!refreshToken) {
        return res.status(400).send({ error: "Refresh token not found" });
      }

      const userData = await UserService.refreshToken(refreshToken);

      req.session.refreshToken = userData.token.refreshToken;
      req.session.accessToken = userData.token.accessToken;

      return res.json(userData);
    } catch (error) {
      console.error("Refresh error:", error);
      next(error);
    }
  }

  async giveUser(req, res, next) {
    try {
      const users = await UserService.getAllUsers();

      return res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      next(error);
    }
  }

  async seurchUser(req, res, next) {
    try {
      const { textSearch } = req.query;

      if (!textSearch) {
        return res.status(400).send({ error: "Name not found in query" });
      }

      const user = await UserBase.findOne({ where: { userName: textSearch } });

      if (!user) {
        return res.status(404).send({ error: "User  not found" });
      }

      return res.json(user);
    } catch (error) {
      console.error("Search user error:", error);
      next(error);
    }
  }
}

module.exports = new UserController();
