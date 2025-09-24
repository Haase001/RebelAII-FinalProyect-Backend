import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/client.js'; // ajusta la ruta si es necesario

const router = express.Router();

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

        // Devuelve el usuario sin la contraseña
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Error en /signup:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export { router };
