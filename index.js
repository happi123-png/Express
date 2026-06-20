const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const sequelize = require('./config/database');
const Film = require('./models/Film');
const FilmLocal = require('./routes/filmsLocal');
const verification = require('./middlewares/verifierToken');
const authRouter = require('./routes/auth');
const User = require('./models/User');

const app = express();
const port = 3000;

app.use(express.json());

const filmsRouter = require('./routes/films');

app.use('/films', filmsRouter);
app.use('/api/local/films', FilmLocal);

// ⚡ MODIFIÉ ICI : On ajoute /v1 pour correspondre parfaitement à Swagger !
app.use('/api/v1/auth', authRouter);

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
            url: 'http://localhost:3000', // Modifié ici sans le suffixe pour utiliser le préfixe complet des routes
            description: 'Serveur de Développement Local'
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
        security: [{
            BearerAuth: []
        }]
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

sequelize.sync({ force: false })
    .then(() => console.log('Base de données synchronisée'))
    .catch(err => console.log('Erreur sync : ', err));

app.listen(port, () => console.log('Serveur sur http://localhost:3000'));