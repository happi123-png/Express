const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const { Op } = require('sequelize');
const verification = require('../middlewares/verifierToken');

/**
 * @swagger
 * /api/v1/auth/signup-web:
 * post:
 * summary: Inscription via le Web (Pré-inscription avant OTP)
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - nom
 * - email
 * - tel
 * - password
 * properties:
 * nom:
 * type: string
 * example: Josquin Bryol
 * email:
 * type: string
 * example: josquin@example.com
 * tel:
 * type: string
 * example: "+237677123456"
 * password:
 * type: string
 * example: MonMotDePasseSecurise
 * responses:
 * 201:
 * description: Utilisateur créé avec succès.
 * 400:
 * description: Champs manquants ou identifiants déjà utilisés.
 */
router.post('/signup-web', async (req, res) => {
    try {
        const { nom, email, tel, password } = req.body;

        if (!nom || !email || !tel || !password) {
            return res.status(400).json({ Message: 'Tous les champs sont obligatoires' });
        }

        const userExit = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { tel: tel }
                ]
            }
        });

        if (userExit) {
            return res.status(400).json({ message: 'Email ou Numéro de téléphone déjà utilisé' });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            nom,
            email,
            tel,
            password: hash
        });

        res.status(201).json({
            Message: 'Utilisateur créé avec succès',
            information: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                tel: user.tel
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
    }
});

/**
 * @swagger
 * /api/v1/auth/login-web:
 * post:
 * summary: Étape 1 - Connexion Web (Vérification email/password avant OTP)
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * example: josquin@example.com
 * password:
 * type: string
 * example: MonMotDePasseSecurise
 * responses:
 * 200:
 * description: Identifiants valides. Étape 1 réussie.
 * 401:
 * description: Identifiants incorrects.
 */
router.post('/login-web', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe obligatoires' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ Message: 'Identifiant ou Mot de passe incorrect' });
        }

        const motdepassevalide = await bcrypt.compare(password, user.password);
        if (!motdepassevalide) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email
        }, process.env.JWT_SECRET || 'SECRET_PROVISOIRE', { expiresIn: '1H' });

        res.status(200).json({
            message: 'Connexion réussie (Étape 1)',
            user: {
                name: user.nom,
                email: user.email,
                tel: user.tel,
            },
            token: token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de la connexion" });
    }
});

/**
 * @swagger
 * /api/v1/auth/me:
 * get:
 * summary: Obtenir le profil de l'utilisateur connecté
 * tags: [Authentication]
 * security:
 * - BearerAuth: []
 * responses:
 * 200:
 * description: Succès. Renvoie les infos du profil.
 * 401:
 * description: Token absent ou invalide.
 */
router.get('/me', verification, async (req, res) => {
    res.status(200).json({
        message: 'Bienvenue sur votre profil',
        user: req.user
    });
});

module.exports = router;