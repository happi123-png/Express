const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Film = sequelize.define('Film', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statuts: {
        type: DataTypes.STRING,
        allowNull: false
    },
    note: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
}, {
    tableName: 'films',
    timestamps: true
});

module.exports = Film