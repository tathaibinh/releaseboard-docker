import axios from 'axios'
import _ from 'lodash'

export var _server = axios.create({
  // Base url should be whatever the url of the Nginx server is
  // Nginx proxies all requests with '/releases' to http://api:3000
  // baseURL: 'http://localhost'
  // localhost:3000 is used for testing purposes
  baseURL: 'http://localhost:3000'
})

export function getReleases (callback) {
  _server.get('/releases').then(response => {
    let headers = []
    let data = []
    if (typeof response.data !== 'undefined' && response.data.length > 0) {
      let data = response.data.slice()
      data.map((item) => {
        item.MOP = JSON.parse(item.MOP) // Convert string to boolean
        item.tagged = JSON.parse(item.tagged) // Convert string to booleanß
      })
      // Derive headers from response keys, strip any values starting with _
      let keys = _.filter(Object.keys(data[0]), (key) => {
        return !_.startsWith(key, '_')
      })
      // Build header objs
      keys.map((key) => {
        headers.push({
          text: _.capitalize(key),
          value: key,
          left: true
        })
      })
      // Use the callback to set headers and items
      callback(headers, data)
    } else {
      callback(headers, data)
    }
  }).catch(e => {
    console.error('There was an error when calling the server')
    console.error(e.message)
  })
}

export function postChanges (data, callback) {
  let promises = []
  data.map((release) => {
    let url = '/releases/' + release._id
    let request = _server.put(url, release)
    promises.push(request)
  })
  axios.all(promises).then(callback)
}
