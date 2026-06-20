const express = require('express');
const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const response = await fetch('https://api.tvmaze.com/shows');
        const data = await response.json();

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des films' });
    }
});

router.get('/search', async(req, res) => {
    try {

        const nom = req.query.nom;
        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${nom}`);
        const data = await response.json();

        if (response.ok) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: 'Aucun film trouvé avec ce nom' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la recherche du film' });
    }
});

router.get('/genre/:genre', async(req, res) => {
    try {
        const genre = req.params.genre;
        const request = await fetch('https://api.tvmaze.com/shows');
        const data = await request.json();

        const filtre = data.filter(d =>
            d.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
        );

        if (filtre.length > 0) {
            res.status(200).json(filtre);
        } else {
            res.status(404).json({ message: 'Aucune série trouvée pour ce genre' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la recherche du genre' });
    }
});
/*
router.get('/films/:id', async (req, res) => {
    try {
        const response = await fetch(`https://api.tvmaze.com/shows/${req.params.id}`);
        const data = await response.json();

        if (response.ok) {
            res.status(200).json(data);
        } else {
            res.status(404).json({ message: 'Aucun film trouvé avec cet ID' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du film' });
    }
});*/



router.get('/stats', async(req, res) => {
    try {
        const request = await fetch('https://api.tvmaze.com/shows');
        const data = await request.json();
        const total = data.length;
        var encour = 0;
        var ending = 0;
        var nifin = 0;

        data.forEach(d => {
            if (d.status === 'Running') {
                encour++;
            } else if (d.status === 'Ended') {
                ending++;
            } else {
                inconnu = d.status;
            }
        });

        const filtre = data.filter(d => d.rating.average !== null);
        var to = 0;
        filtre.forEach(f => {
            to = to + f.rating.average
        });

        const moyenne = to / filtre.length
        res.status(200).json({
            total: total,
            En_cour: encour,
            Terminees: ending,
            Moyenne: moyenne,
            Statut_Inconnu: inconnu
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors du classement'
        });
    }
});

router.get('/:id/episodes', async(req, res) => {
    try {
        const id = req.params.id;

        const [request, request2] = await Promise.all([
            fetch(`https://api.tvmaze.com/shows/${id}`),
            fetch(`https://api.tvmaze.com/shows/${id}/episodes`)
        ]);
        const [data, data2] = await Promise.all([
            request.json(),
            request2.json()
        ]);

        if (request.ok) {
            res.status(200).json({
                serie: {
                    nom: data.name,
                    genres: data.genres,
                    statuts: data.status,
                    note: data.rating.average
                },
                totalEpisode: data2.length,
                episode: data2.map(e => ({
                    id: e.id,
                    nom: e.name,
                    saison: e.season,
                    numero: e.number
                }))
            })
        } else {
            res.status(404).json({ message: 'Aucune donnée' })
        }
    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur"
        })
    }
});

router.get('/top', async(req, res) => {
    try {
        const request = await fetch('https://api.tvmaze.com/shows');
        const data = await request.json();

        const filtre = data.filter(d => d.rating.average !== null);

        const sortslice = filtre.sort((a, b) => { b.rating.average - a.rating.average }).slice(0, 10);
        res.status(200).json(sortslice);

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la recherche"
        })
    }
});

module.exports = router;