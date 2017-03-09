import jsdom from 'jsdom'
import { defer } from 'q'

export default html => {
  const d = defer()
  jsdom.env(html, (err, window) => {
    if (err) {
      return d.reject(err)
    }
    const document = window.document
    const body = document.body
    const root = body.firstChild
    const getComputedStyle = window.getComputedStyle.bind(window)
    const getElementById = document.getElementById.bind(document)
    d.resolve({ window, body, root, getComputedStyle, getElementById })
  })
  return d.promise
}
