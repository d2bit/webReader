const request = require('request')
const cheerio = require('cheerio')

const scrap = (url, selector, cb) => {
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
  const response = {
    statusCode: 200,
    headers: {},
    body: ''
  }

  if (!url || !selector) {
    response.body = 'Missing params'
    return callback(null, response)
  }

  scrap(url, selector, (scrapped) => {
    response.body = JSON.stringify(scrapped)
    callback(null, response)
  })
}
