const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const app = express()

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  const { url, selector } = req.query

  scrap({ url, selector }, (scrapped) => {
    const response = scrapped
    res.send(response)
  })
})

app.listen(PORT, () =>
  console.log(`Listening on port ${PORT}!`)
)

const scrap = ({ url, selector }, cb) => {
  request(url, (err, res, html) => {
    if (err) {
      console.log(`ERROR scrapping '${url}' with '${selector}'!!`, err)
      return
    }

    const $ = cheerio.load(html)

    const headings = $(selector)
    const titles = Object.keys(headings).map(index =>
      $(headings[index])
    ).map(heading => (
      {
        text: heading.text().trim(),
        link: heading.find('a').attr('href')
      }
    )).filter(title =>
      /^\/.+/.test(title.link)
    ).map(title => {
      const link = /^http/.test(title.link)
        ? title.link
        : url + title.link

      return {
        text: title.text,
        link
      }
    })

    cb(titles)
  })
}

exports.handler = (event, context, callback) => {
  const params = event.queryStringParameters
  const url = params && params.url
  const selector = params && params.selector

  scrap({ url, selector }, (scrapped) => {
    const response = {
      statusCode: 200,
      headers: {},
      body: JSON.stringify(scrapped)
    }

    callback(null, response)
  })
}
