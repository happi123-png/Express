const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recompense = sequelize.define('Recompense', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('REDUCTION_ABONNEMENT', 'CREDITS_PLATEFORME'),
        allowNull: false
    },
    montant: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date_attribution: {
        type: DataTypes.DATE, // Correspond à DATETIME
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    date_expiration: {
        type: DataTypes.DATE,
        allowNull: false
    },
    statut: {
        type: DataTypes.ENUM('DISPONIBLE', 'UTILISEE', 'EXPIREE'),
        allowNull: false,
        defaultValue: 'DISPONIBLE'
    },
    professionnel_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'professionnels', 
            key: 'utilisateur_id'
        },
        onDelete: 'CASCADE' // Si le pro est supprimé, ses récompenses aussi
    },
    parrainage_id: {
        type: DataTypes.BIGINT,
        allowNull: true, // Doit être true pour supporter le SET NULL
        references: {
            model: 'parrainages',
            key: 'id'
        },
        onDelete: 'SET NULL' // Si le parrainage est annulé/supprimé, la récompense reste mais perd son lien
    }
}, {
    tableName: 'recompenses',
    timestamps: false // On désactive les createdAt/updatedAt automatiques puisque tu gères tes propres dates
});

module.exports = Recompense;