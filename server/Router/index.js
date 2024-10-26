const express = require('express')
const {Router} = require('express')

const userController = require('../Controller/user-controller')
const accessTokenMiddlewares = require('../Middlewares/accessTokenMiddlewares')
const chatController = require('../Controller/chat-controller')

const router = new Router()


router.get('/access', accessTokenMiddlewares)
router.get('/refresh',userController.refresh)

router.get("/get-frend/:id", chatController.getAllFrendeUser);
router.get('/search-user/:id', userController.seurchUser)

router.post('/get-messange', chatController.getMessages)
router.get('/notification')

router.post('/login',userController.login)
router.post('/registration', userController.registration)

router.post('/save-massange')
router.post('/save-user-chats')
router.post('/save-chats',chatController.saveUserChats)


router.delete('/logout',userController.logout)

module.exports = router