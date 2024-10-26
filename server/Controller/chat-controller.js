const ChatService = require("../Service/chat-service");
const {
  UserBase,
  Message,
  Conversation,
  Contact,
  Notification,
} = require("../Models/base-model");
const { Op, where } = require("sequelize");

class Chat {
  async saveUserChats(req, res, next) {
    try {
      const { friendId, id } = req.body;
      console.log(friendId, id);

      if (!id) {
        return res.status(401).send({ error: "Token not found" });
      }

      if (!friendId) {
        return res
          .status(400)
          .send({ error: "Friend ID not found in request body" });
      }

      // Добавляем друга в контакты текущего пользователя
      const friend = await UserBase.findOne({ where: { userId: friendId } });
      await Contact.create({
        userId: id,
        contactUserId: friendId,
        contactUserName: friend.userName,
      });

      // Добавляем текущего пользователя в контакты друга
      const user = await UserBase.findOne({ where: { userId: id } });
      await Contact.create({
        userId: friendId,
        contactUserId: id,
        contactUserName: user.userName,
      });

      return res.json({ success: true });
    } catch (error) {
      console.error(`Error saving user chats: ${error}`);
      next(error);
    }
  }

  async getAllFrendeUser(req, res, next) {
    try {
      const { id } = req.params;
      console.log(id);

      if (!id) {
        return res.status(400).send({ error: "Id not found" });
      }

      const friends = await Contact.findAll({
        where: { userId: id },
        include: [{ model: UserBase }],
      });

      const friendsData = friends.map((friend) => {
        if (friend.UserBase) {
          return {
            userName: friend.UserBase.userName,
            userId: friend.UserBase.userId,
          };
        } else {
          return {
            userName: friend.contactUserName,
            userId: friend.contactUserId,
          };
        }
      });

      // Ищем имя пользователя по contactUserId
      const friendsDataWithNames = await Promise.all(
        friendsData.map(async (friend) => {
          if (friend.userId === id) {
            return friend;
          } else {
            const user = await UserBase.findOne({
              where: { userId: friend.userId },
            });
            return {
              userName: user.userName,
              userId: friend.userId,
            };
          }
        })
      );

      console.log(friendsDataWithNames);
      return res.json({ myFriends: friendsDataWithNames });
    } catch (error) {
      console.error(`Error getting all friends: ${error}`);
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {

      const { friendId, userId } = req.body;

      if (!friendId) {
        return res
          .status(400)
          .send({ error: "Friend ID not found in request body" });
      }

      if (!userId) {
        return res
          .status(400)
          .send({ error: "User   ID not found in request body" });
      }

      const messageData = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: userId, recipientId: friendId },
            { senderId: friendId, recipientId: userId },
          ],
        },
        order: [["Date", "ASC"]],
      });

      return res.json(messageData);
    } catch (error) {
      console.error(`Error getting messages: ${error}`);
      next(error);
    }
  }
}

module.exports = new Chat();
