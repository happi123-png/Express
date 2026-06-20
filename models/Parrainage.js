const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Parrainage = sequelize.define('Parrainage', {
    id: {
        type: DataTypes.BIGINT, // Correspond à ton BIGINT
        primaryKey: true,
        autoIncrement: true
    },
    code_saisi: {
        type: DataTypes.STRING(50), // Correspond à VARCHAR(50)
        allowNull: false
    },
    date_parrainage: {
        type: DataTypes.DATE, // Correspond à DATETIME
        allowNull: false,
        defaultValue: DataTypes.NOW // Équivalent de DEFAULT CURRENT_TIMESTAMP
    },
    date_activation: {
        type: DataTypes.DATE,
        allowNull: true // Équivalent de NULL
    },
    statut: {
        type: DataTypes.ENUM('VALIDE', 'SUSPECTE', 'INVALIDEE'),
        allowNull: false,
        defaultValue: 'VALIDE'
    },
    parrain_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'professionnels', // Le nom exact de la table ciblée dans la BD
            key: 'utilisateur_id'
        },
        onDelete: 'RESTRICT'
    },
    filleul_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
        references: {
            model: 'professionnels',
            key: 'utilisateur_id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'parrainages',
    timestamps: false // Désactivé car tu gères toi-même les dates avec 'date_parrainage' et 'date_activation' au lieu des 'createdAt' et 'updatedAt' standards
})

module.exports = Parrainage