const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpCode = sequelize.define('OtpCode', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true // nullable car l'OTP peut être généré avant la création du compte (signup)
    },
    canal: {
        type: DataTypes.ENUM('email', 'sms'),
        allowNull: false
    },
    destinataire: {
        type: DataTypes.STRING,
        allowNull: false // l'email ou le numéro qui a reçu le code
    },
    code_hash: {
        type: DataTypes.STRING,
        allowNull: false // jamais le code en clair
    },
    tentatives: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    expire_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    utilise: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'otp_codes',
    timestamps: true // ajoute createdAt et updatedAt
});

module.exports = OtpCode;