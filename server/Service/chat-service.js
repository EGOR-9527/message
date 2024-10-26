// chat-service.js
const { UserBase, Contact, Message } = require("../Models/base-model");
const uuid = require("uuid");

class ChatService {
  async saveUserChats(friendId, userId) {
    try {
      const user = await UserBase.findByPk(userId);

      if (!user) {
        throw new Error(`User not found with id ${userId}`);
      }

      const friend = await UserBase.findByPk(friendId);

      if (!friend) {
        throw new Error(`Friend not found with id ${friendId}`);
      }

      if (friendId === userId) {
        throw new Error("Cannot save self as friend");
      }

      const existingContact = await Contact.findOne({
        where: {
          userId: userId,
          contactUserId: friendId,
        },
      });

      if (existingContact) {
        throw new Error(
          `Contact already exists for userId ${userId} and friendId ${friendId}`
        );
      }

      const newContact = await Contact.create({
        userId: userId,
        contactUserId: friendId,
      });

      return { newContact };
    } catch (error) {
      console.error(`Error saving user chats: ${error}`);
      throw new Error(`Error saving user chats`, error);
    }
  }

  async getAllFrendeUser(userId) {
    try {
      const user = await UserBase.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error("User  not found");
      }

      const friends = await user.getFriends();

      return friends;
    } catch (error) {
      throw error;
    }
  }

  async getMessages(req, res, next) {
    try {
      const token = req.headers.authorization.split(" ")[1];

      console.log(token)

      if (!token) {
        return res.status(401).send({ error: "Token not found" });
      }

      const { friendId, userId } = req.body;

      if (!friendId) {
        return res
          .status(400)
          .send({ error: "Friend ID not found in request body" });
      }

      if (!userId) {
        return res
          .status(400)
          .send({ error: "User ID not found in request body" });
      }

      const messageData = await Message.findAll({
        where: {
          $or: [
            { senderId: userId, recipientId: friendId },
            { senderId: friendId, recipientId: userId },
          ],
        },
      });

      return res.json(messageData);
    } catch (error) {
      console.error(`Error getting messages: ${error}`);
      next(error);
    }
  }
}

module.exports = new ChatService();
