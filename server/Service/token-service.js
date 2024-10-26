require('dotenv').config();
const jwt = require('jsonwebtoken');
const { UserBase } = require('../Models/base-model');

class TokenService {

    generateToken(payload) {

        try {

            if (!process.env.JWT_ACCESS_KEY || !process.env.JWT_REFRASH_KEY) {
                throw new Error('Секретные ключи JWT не определены');
              }
              

            const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '15m' });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRASH_KEY, { expiresIn: '7d' });

            return { accessToken, refreshToken };

        }catch(err){
            console.error("Ошибка генирации токена:", err);
            return null;
        }

    }

    async apdeateAccessToken(payload, refreshToken) {
        try {
            const user = await UserBase.findOne({ where: { refreshToken: refreshToken } });
    
            if (!user) {
                throw new Error('Токен не найден');
            }
    
            if (jwt.verify(refreshToken, process.env.JWT_REFRASH_KEY)) {
                const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: '15m' });
                return { accessToken };
            } else {
                throw new Error('Токен недействителен');
            }
    
        } catch (err) {
            console.error('Ошибка обновления токена:', err);
            return null;
        }
    }


    validateToken(tokenm, secretKey) {

        try {

            return jwt.verify(tokenm, secretKey)

        }catch(err){

            console.error('Ошибка валидации токена:', error);
            return null;

        }

    }


    async saveToken(email, refreshToken) {

        try {

            const tokenData = await UserBase.findOne({where: {userEmail: email}})

            if(tokenData) {

                tokenData.refreshToken = refreshToken;
                return await tokenData.save();

            }

            return await UserBase.create({ userEmail:email, refreshToken: refreshToken});

        }catch{

            console.error('Ошибка сохранения токена:', error);
            return null;

        }

    }

    async removeToken(refreshToken) {

        try{

            if(!refreshToken) {
                throw new Error('Не указан refreshToken');
            }

            const user = await UserBase.findOne({where: {refreshToken}});

            if (user) {
                user.refreshToken = null;
                await user.save();
                return 'Токен пользователя успешно удален';
              } else {
                return 'Пользователь с таким токеном не найден';
              }

        }catch(error){

            console.error('Ошибка удаления токена пользователя:', error);
            throw error;

        }

    }

    async seurchUser(name) {

        try{

            const user = await UserBase.getByName(name);

            return user

        }catch(error){

            console.error('Ошибка поиска пользователя:', error);
            throw error;

        }

    }

}

module.exports = new TokenService();