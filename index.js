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

let sorties = [];
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
                transporter.sendMail({...mailOptions, html: formatMail()}, function(error, info){
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
    return
    setInterval(() => {
        getSorties()
    }, 3000)
}

runner()

const app = express()

app.get('/', (req, res) => {
    res.json(sorties)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

