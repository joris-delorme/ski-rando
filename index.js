const PORT = process.env.PORT || 8000;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');


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

const articles = [];

newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
    .then(response => {

        const html = response.data;
        const $ = cheerio.load(html);

        $('[type="article"], [data-testid="search-bodega-result"]', html).each((i, elm ) => {
            let title = ''
            if (newspaper.name === 'bbc') {
                title = $(elm).find('a').text();
            } else {
                title = $(elm).find('h4').text();
            }
            const imgURL = $(elm).find('img').attr('src');
            const url = newspaper.base + $(elm).find('a').attr('href');
            articles.push({
                title,
                url,
                imgURL,
                source: newspaper.name
            })
        })
    }).catch((err) => console.log(err))
})

const app = express()

app.get('/', (req, res) => {
    res.json("Hello World")
})

app.get('/news', (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperId', async(req, res) => {

    const newspaperId =req.params.newspaperId
    const newspaper = newspapers.filter(newspaper => newspaper.name === newspaperId)[0]

    axios.get(newspaper.address)
    .then(response => {

        const html = response.data;
        const $ = cheerio.load(html);
        const articles2 = [];

        $('[type="article"], [data-testid="search-bodega-result"]', html).each((i, elm ) => {
            let title = ''
            if (newspaper.name === 'bbc') {
                title = $(elm).find('a').text();
            } else {
                title = $(elm).find('h4').text();
            }
            const imgURL = $(elm).find('img').attr('src');
            const url = newspaper.base + $(elm).find('a').attr('href');
            articles2.push({
                title,
                url,
                imgURL,
                source: newspaper.name
            })
        })
        res.json(articles2)
    }).catch((err) => console.log(err))
} )

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

