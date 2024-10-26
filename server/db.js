const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres' // Указываем, что используем PostgreSQL
});

module.exports = sequelize; // Экспортируем объект sequelize, а не только Sequelize