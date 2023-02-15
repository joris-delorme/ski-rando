const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
var nodemailer = require('nodemailer');


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'joris.delorme38@gmail.com',
        pass: 'nsybiicmqwhgvgay'
    }
});

var mailOptions = {
    from: 'joris.delorme38@gmail.com',
    to: 'regs.del@gmail.com',
    subject: 'De nouvelles excurtions sont disponibles !',
    text: ""
};

const equalsCheck = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
}

const formatMail = () => {
    let res = ''

    for (let i = 0; i < sorties.length; i++) {
        res += `<h2>${sorties[i].day}</h2><br />`
        for (let j = 0; j < sorties[i].sorties.length; j++) {
            res += `<p>${sorties[i].sorties[j]}</p>`
        }
        res += '<br />'
    }

    return res
}

const newspapers = [
    {
        name: 'bbc',
        address: 'https://www.bbc.com/news/topics/cew4lqxzlkgt',
        base: 'https://www.bbc.com',
    },
    {
        name: 'newyorktimes',
        address: 'https://www.nytimes.com/search?query=rabbit',
        base: 'https://www.nytimes.com',
    }
]

let sorties = [
    {
        "day": "Mer 15 Février",
        "sorties": [
            "SEANCE BLOC CROIZAT 18H-20H",
            "Soirée Apéro repas / jeu vidéo (Tekken)"
        ]
    },
    {
        "day": "Jeu 16 Février",
        "sorties": [
            "Escalade libre adulte Croizat 12h-14h"
        ]
    },
    {
        "day": "Ven 17 Février",
        "sorties": [
            "Escalade gare 6h30-8h",
            "Croizat 20h - 22h"
        ]
    },
    {
        "day": "Sam 18 Février",
        "sorties": [
            "alpinisme facile à Chamonix REPORTEE [jour 1]",
            "Escalade à la Gare 9-12H 18/2"
        ]
    },
    {
        "day": "Dim 19 Février",
        "sorties": [
            "Les Contamines - Sortie en Station",
            "DECOUVERTE SKI DE RANDO"
        ]
    },
    {
        "day": "Lun 20 Février",
        "sorties": [
            "Escalade libre adulte P. COT 20h-22h"
        ]
    },
    {
        "day": "Mar 21 Février",
        "sorties": [
            "Au refuge des Aiguilles d'Arves [jour 1]",
            "Vers le Grand Croisse Baulet",
            "Boutron mardi 20 22h"
        ]
    },
    {
        "day": "Mer 22 Février",
        "sorties": [
            "Escalade en salle",
            "Soirée encadrant / co-encadrant - RETEX GESTION COURSE COMMUNICATION"
        ]
    },
    {
        "day": "Jeu 23 Février",
        "sorties": [
            "Escalade libre adulte P. COT 20h-22h"
        ]
    },
    {
        "day": "Ven 24 Février",
        "sorties": [
            "Week-end ski de fond à Bessans [jour 1]",
            "Raquette alpine et CSV à La Grave [jour 1]"
        ]
    },
    {
        "day": "Sam 25 Février",
        "sorties": [
            "CAMP DE BASE ALPI #1 [jour 1]",
            "Ecole d'Av 'perfectionnement' - Alpi neige/glace 2 jours [jour 1]",
            "Escalade Cot 9-12h 25/2",
            "Trail Blanc Nocturne LA FEE BLANCHE"
        ]
    },
    {
        "day": "Dim 26 Février",
        "sorties": [
            "Trail du Grésivaudan: 30km OU 22km+8km en relais OU 8km",
            "L'Alpe d'Huez - Sortie en Station",
            "Le Grand Crétet"
        ]
    }
];
let temp = []

const getSorties = () => {
    axios.get("https://www.cafchambery.com/agenda.html")
        .then(response => {

            const html = response.data;
            const $ = cheerio.load(html);
            temp = [...sorties]
            sorties = []

            $('tr', html).each((i, elm) => {
                let day = $(elm).find('.agenda-gauche').text()
                let newSorties = []

                $('.agenda-evt-debut', elm).each((i, sortie) => {
                    //console.log('------------');
                    if ($(sortie).find(".temoin-places-dispos.on").html() !== null) {
                        let s = $(sortie).find("h2").text().replace('\n', '')
                        newSorties.push(s.slice(3, s.length - 2))
                    }
                })

                if (newSorties.length) {
                    sorties.push({
                        day: day,
                        sorties: newSorties
                    })
                }
            })

            if (!equalsCheck(sorties, temp)) {
                transporter.sendMail({ ...mailOptions, html: formatMail() }, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }

        }).catch((err) => console.log(err))
}

const runner = () => {
    getSorties()
    setInterval(() => {
        getSorties()
    }, 10800000)
}

runner()

const app = express()

app.get('/', (req, res) => {
    res.json(sorties)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

