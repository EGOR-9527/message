require("dotenv").config();
const express = require("express");
const session = require("express-session");
const TokenService = require("../Service/token-service");
const { UserBase } = require("../Models/base-model");
const UserService = require("../Service/user-service");

module.exports = async function (req, res, next) {
  try {
    // Check if session exists
    if (!req.session) {
      throw new Error("Session not found");
    }

    // Retrieve tokens from session
    let { accessToken, refreshToken } = req.session;

    if (!accessToken && !refreshToken) {
      throw new Error("Токены не переданы");
    }

    const user = await UserBase.findOne({
      where: { refreshToken: refreshToken },
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (!accessToken) {
      try {
        const userData = await UserService.refreshToken(refreshToken);
        req.session.accessToken = userData.tokens.accessToken;
        req.session.refreshToken = userData.tokens.refreshToken;
        return res.json(userData);
      } catch (error) {
        console.error(error);
      }
    }

    const validateRefreshToken = await TokenService.validateToken(
      accessToken,
      process.env.JWT_ACCESS_KEY
    );

    if (!validateRefreshToken) {
      try {
        const userData = await UserService.refreshToken(refreshToken);
        req.session.accessToken = userData.tokens.accessToken;
        req.session.refreshToken = userData.tokens.refreshToken;
        return res.json(userData);
      } catch (error) {
        console.error(error);
      }
    } else {
      const token = TokenService.generateToken({
        email: user.userEmail,
        password: user.userPassword,
      });
      req.session.accessToken = token;
      return res.json(token);
    }
  } catch (err) {
    next(err);
  }
};
