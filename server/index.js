require("dotenv").config();

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cookieParser = require("cookie-parser");
const session = require("express-session"); // Добавьте эту строку
const router = require("./Router/index");
const { Server } = require("socket.io");
const sequelize = require("./db");
const cors = require("cors");
const ChatService = require("./Service/chat-service");
const { Socket } = require("dgram");
const { Message } = require("./Models/base-model");
const uuid = require("uuid");
const varMiddleware = require("./Middlewares/variables");

const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

const sessionOptions = {
  secret: "your_secret_key_here",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
};

app.set("trust proxy", 1);
app.use(session(sessionOptions));
app.use(varMiddleware);

app.use("/api", router);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Пользователь успешно подключон!");

  socket.on("join", (data) => {
    console.log(
      "Пользователь присоединился к чату:",
      data.userId,
      data.friendId
    );
    socket.join(data.userId);
    socket.join(data.friendId);
  });

  socket.on("message", async (data) => {
    try {
      const currentDate = new Date();

      console.log("data", data);

      const userId = data.userId;
      const friendId = data.friendId;
      const message = data.message;

      console.log("message", message);

      const mesasgeData = await Message.create({
        messageId: uuid.v4(),
        content: message,
        Date: currentDate,
        senderId: userId,
        recipientId: friendId,
      });

      console.log("Сообщение: " + mesasgeData.dataValues);

      const messageData = {
        messageId: mesasgeData.messageId,
        content: mesasgeData.content,
        Date: mesasgeData.Date,
        senderId: mesasgeData.senderId,
        recipientId: mesasgeData.recipientId,
      };

      console.log("messageData", messageData.content);

      if (data.friendId) {
        io.to(data.friendId).emit("receiveMessage", messageData);
      }
    } catch (err) {
      console.log("Ошибка при сохранении сообщения в базе: " + err);
    }
  });
});

const start = async () => {
  try {
    server.listen(PORT, () =>
      console.log(`Сервер запущен успешно: http://localhost:${PORT}`)
    );

    await sequelize.authenticate();
    await sequelize.sync();
  } catch (err) {
    console.error("Ошибка при подключении к БД:", err);
  }
};

start();
