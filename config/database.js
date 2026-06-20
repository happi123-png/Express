const { Sequelize } = require('sequelize')
require('dotenv').config()
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
    host: process.DB_HOST,
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => console.log('Connexion a MySql reussie'))
    .catch(err => console.log('Erreur de connexion : ', err));


module.exports = sequelize;