const sequelize = require('../db');
const { DataTypes } = require('sequelize');

// Определяем модель UserBase (не изменена)
const UserBase = sequelize.define("User", {
    // Уникальный идентификатор пользователя
    userId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    // Фамилия пользователя
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Имя пользователя (уникальное и необязательное)
    userName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    // Email пользователя (уникальный и необязательный)
    userEmail: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    // Пароль пользователя (необязательный)
    userPassword: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Токен обновления для пользователя (необязательный)
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true, 
        defaultValue: null 
    }
});

// Определяем модель Message первой, так как она используется в модели Chat
// Модель Message представляет собой отдельное сообщение в чате
const Message = sequelize.define('Messages', {
    // Уникальный идентификатор сообщения
    messageId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    // Текстовое содержимое сообщения
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // Дата и время отправки сообщения (по умолчанию - текущая дата и время)
    Date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // Идентификатор пользователя, отправляющего сообщение
    senderId: {
        type: DataTypes.UUID,
        references: {
            model: UserBase,
            key: 'userId'
        }
    },
    // Идентификатор пользователя, получающего сообщение
    recipientId: {
        type: DataTypes.UUID,
        references: {
            model: UserBase,
            key: 'userId'
        }
    }
});

// Определяем модель Conversation
// Модель Conversation представляет собой отдельный разговор между двумя пользователями
const Conversation = sequelize.define('Conversations', {
    // Уникальный идентификатор разговора
    conversationId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    // Идентификатор пользователя, участвующего в разговоре
    userId: {
        type: DataTypes.UUID,
        references: {
            model: UserBase,
            key: 'userId'
        }
    },
    // Идентификатор другого пользователя, участвующего в разговоре
    otherUserId: {
        type: DataTypes.UUID,
        references: {
            model: UserBase,
            key: 'userId'
        }
    },
    // Тема разговора
    subject: {
        type: DataTypes.STRING
    }
});

// Определяем модель Contact
// Модель Contact представляет собой контакт между двумя пользователями
const Contact = sequelize.define('Contacts', {
    // Уникальный идентификатор контакта
    contactId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    // Идентификатор пользователя, владеющего контактом
    userId: {
        type: DataTypes.UUID,
        references: {
            model: UserBase,
            key: 'userId'
        }
    },
    // Идентификатор пользователя, добавляемого в качестве контакта
    contactUserId: {
        type: DataTypes.UUID,
        references: {
            model: UserBase,
            key: 'userId'
        }
    }
});

// Определяем модель Notification
// Модель Notification представляет собой уведомление для пользователя
const Notification = sequelize.define('Notifications', {
    // Уникальный идентификатор уведомления
    notificationId: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    // Идентификатор пользователя, получающего уведомление
    userId: {
        type: DataTypes.UUID,
        references: {
            model: UserBase,
            key: 'userId'
        }
    },
    // Текстовое содержимое уведомления
    content: {
        type: DataTypes.TEXT
    },
    // Дата и время отправки уведомления (по умолчанию - текущая дата и время)
    Date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Определяем связи между моделями
// Пользователь может отправлять несколько сообщений
UserBase.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(UserBase, { foreignKey: 'senderId' });

// Пользователь может получать несколько сообщений
UserBase.hasMany(Message, { foreignKey: 'recipientId' });
Message.belongsTo(UserBase, { foreignKey: 'recipientId' });

// Пользователь может участвовать в нескольких разговорах
UserBase.hasMany(Conversation, { foreignKey: 'userId' });
Conversation.belongsTo(UserBase, { foreignKey: 'userId' });

// Пользователь может иметь несколько контактов
UserBase.hasMany(Contact, { foreignKey: 'userId' });
Contact.belongsTo(UserBase, { foreignKey: 'userId' });

// Пользователь может получать несколько уведомлений
UserBase.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(UserBase, { foreignKey: 'userId' });

module.exports = { UserBase, Message, Conversation, Contact, Notification };

// Синхронизация моделей с базой данных
sequelize.sync({ force: false }) // force: false чтобы не удалять существующие таблицы
    .then(() => {
        console.log('Модели синхронизированы с базой данных');
    })
    .catch((error) => {
        console.error('Ошибка при синхронизации моделей:', error);
    });