import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from '../prisma/client.js';
import { router as authRoutes } from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', conversationRoutes);

// Ruta de prueba para verificar conexión con la base de datos
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany(); // Consulta todos los usuarios
        res.json(users); // Devuelve el resultado como JSON
    } catch (error) {
        console.error('Error al consultar usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
