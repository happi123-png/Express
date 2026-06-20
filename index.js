require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const sequelize = require('./config/database');

const filmsRouter = require('./routes/films');
const FilmLocal = require('./routes/filmsLocal');
const authRouter = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;
const apiUrl = process.env.API_URL || `http://localhost:${port}`;

// ===================== MIDDLEWARES GLOBAUX =====================
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Rate limiting dédié à l'auth (OTP SMS = ressource coûteuse + cible de brute-force)
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' }
});

// ===================== ROUTES =====================
app.use('/api/v1/films', filmsRouter);
app.use('/api/v1/films/local', FilmLocal);
app.use('/api/v1/auth', otpLimiter, authRouter);

// ===================== SWAGGER =====================
const swaggerOptions = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'API HAIR COSMETIC 1.0',
            version: '1.0.0',
            description: 'Documentation de l\'API REST pour l\'application HAIR COSMETIC.\n\nTous les endpoints authentifiés nécessitent un Bearer Token JWT dans l\'header Authorization.',
            contact: {
                name: 'HAIR COSMETIC IT Solutions',
                email: 'support@haircosmetic.com'
            },
            license: {
                name: 'Apache 2.0',
                url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
            }
        },
        servers: [{
            url: apiUrl,
            description: process.env.NODE_ENV === 'production'
                ? 'Serveur de Production'
                : 'Serveur de Développement Local'
        }],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Entrez votre token JWT généré lors de la validation OTP pour accéder aux routes sécurisées.'
                }
            }
        },
        security: [{ BearerAuth: [] }]
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ===================== 404 =====================
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// ===================== ERREUR CENTRALISÉE =====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Erreur serveur interne'
    });
});

// ===================== DÉMARRAGE =====================
const syncOptions = process.env.NODE_ENV === 'development' ? { force: false } : {};

sequelize.sync(syncOptions)
    .then(() => console.log('Base de données synchronisée'))
    .catch(err => console.error('Erreur sync :', err));

const server = app.listen(port, () => {
    console.log(`Serveur sur ${apiUrl}`);
});

// ===================== ARRÊT PROPRE =====================
const shutdown = async (signal) => {
    console.log(`${signal} reçu, arrêt en cours...`);
    server.close(async () => {
        await sequelize.close();
        console.log('Connexions fermées proprement');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));