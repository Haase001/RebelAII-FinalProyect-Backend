import express from 'express';
import prisma from '../../prisma/client.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

//Ruta para crear una nueva conversación
router.post('/conversations', verifyToken, async (req, res) => {
    const { title } = req.body;

    try {
        const conversation = await prisma.conversation.create({
            data: {
                title,
                userId: req.user.userId,
            },
        });

        res.status(201).json(conversation);
    } catch (error) {
        console.error('Error al crear conversación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Ruta para mandar los mensajes a cada conversación
router.post('/conversations/:id/messages', verifyToken, async (req, res) => {
    const { sender, content } = req.body;
    const conversationId = parseInt(req.params.id);

    try {
        const message = await prisma.message.create({
            data: {
                sender,
                content,
                conversationId,
            },
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error al guardar mensaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Ruta para obtener los mensajes de la conversación
router.get('/conversations/:id/messages', verifyToken, async (req, res) => {
    const conversationId = parseInt(req.params.id);

    try {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }, // orden cronológico
        });

        res.json(messages);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Ruta para obtener todas las conversaciónes
router.get('/conversations', verifyToken, async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' }, // más recientes primero
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        });

        res.json(conversations);
    } catch (error) {
        console.error('Error al obtener conversaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
