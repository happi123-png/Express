const express = require('express');
const router = express.Router();
const Film = require('../models/Film');
const axios = require('axios');
const { DatabaseError } = require('sequelize');
const verification = require('../middlewares/verifierToken')

router.get('/', async (req, res) => {
    try {
        const films = await Film.findAll();
        if (films.length > 0) {
            res.status(200).json(films);
        } else {
            res.statut(200).json({ Message: "Aucun filme en base de donnée" })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur lors de la recuperation des films" })
    }
})

router.use(verification)
router.post('/', async (req, res) => {
    try {
        const {
            titre,
            genre,
            statuts,
            note,
            createdAt,
            updatedAt
        } = req.body;

        const nouveauFilms = await Film.create({
            titre: titre,
            genre: genre,
            statuts: statuts,
            note: note
        });
        res.status(201).json({
            message: "Films ajouté avec succes en local",
            donnes: nouveauFilms
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Erreur serveur lors de l'insertion du film" })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const idlocal = req.params.id
        const film = await Film.findByPk(idlocal);
        if (!film) {
            return res.status(404).json({ message: "Film introuvable en local" });
        }

        res.status(200).json(film);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Message: "Erreur serveur lorsd de la recherche par id." })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const {
            titre,
            genre,
            statuts,
            note,
            createdAt,
            updatedAt
        } = req.body;
        const id = req.params.id
        const film = await Film.findByPk(id);
        if (!film) {
            return res.status(404).json({ Message: "Film introuvable pour la mis a jour" })
        }
        film.titre = titre || film.titre
        film.genre = genre || film.genre
        film.statuts = statuts || film.statuts
        film.note = note !== undefined ? note : film.note

        await film.save()

        res.status(200).json({
            message: 'Film mis a jour avec succes',
            donnees: film
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ code: 500, Message: 'Erreur serveur lors de la modification' })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const film = await Film.findByPk(id)

        if (!film) {
            return res.status(404).json({ Message: "Film non trouve pour la suppression" })
        }
        await film.destroy();
        res.status(200).json({
            message: `Le film "${film.titre}" a été supprimé avec succes de la base `
        })
    } catch (error) { res.statut(500).json({ message: "Erreur serveur lors de la suppression du film" }) }
});

router.post('/import/:nom', async (req, res) => {
    const nomFilm = req.params.nom
    console.log(`Recherche en ligne pour :${nomFilm}`)
    const request = await axios.get(`https://api.tvmaze.com/singlesearch/shows?q=${nomFilm}`);
    const dataFilm = request.data;

    if (!dataFilm) {
        return res.status(404).json({
            message: `Aucun films trouve en ligne pour le nom: ${nomFilm}`
        })
    }


    const genreadapte = dataFilm.genres && dataFilm.genres.length > 0 ? dataFilm.genres[0] : 'Inconnu'
    const note = dataFilm.rating ? dataFilm.rating.average : null
    const filmexiste = await Film.findOne({
        where: { titre: dataFilm.name }
    })
    if (filmexiste) {
        return res.status(400).json({
            message: 'Ce film existe déjà dans la base de donné',
            donnees: filmexiste
        })
    }
    const nouveauFilm = await Film.create({
        titre: dataFilm.name,
        genre: genreadapte,
        statuts: dataFilm.status,
        note: note
    })

    res.status(201).json({
        message: 'Film importe avec succes',
        donnees: dataFilm

    })
})

module.exports = router