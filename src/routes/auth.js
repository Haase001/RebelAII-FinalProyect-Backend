import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client.js'; // ajusta la ruta si es necesario
import { verifyToken } from '../middleware/authMiddleware.js';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_secreta';

//Ruta para verificar si un usuario está registrado
router.post('/check-email', async (req, res) => {
    const { email } = req.body;
    console.log("📩 Email recibido:", email);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        console.log("👀 Resultado de búsqueda:", user);

        if (user) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error en /check-email:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Ruta para registrar usuarios
router.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName, birthDate } = req.body;

    try {
        // Verifica si el usuario ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encripta la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea el usuario en la base de datos
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                birthDate: birthDate ? new Date(birthDate) : null,
            },
        });

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Error en /signup:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Ruta para loggear usuarios
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por correo
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Devolver token y datos del usuario
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Error en /login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Ruta protegida /profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                birthDate: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error en /profile:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export { router };
