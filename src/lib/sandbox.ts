// Model-written pages (move figures, try-it explainers) run in an iframe with sandbox="allow-scripts" only, via srcdoc.
// This adds a Content-Security-Policy inside the page so its code can't fetch, post, or load anything from the network:
// scripts and styles inline only, images only as data: URIs. (8 Oct, from the other session's security check.)
const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src 'none'; connect-src 'none'; form-action 'none'; base-uri 'none'">`
// A try-it page is asked to fit 520 px, and some squeeze their buttons and cut their own text when it runs longer
// (10 Oct, Hold a room day 1: option lines and the closing message clipped). With fit, the page grows and scrolls
// inside its frame instead, and buttons keep their height.
// 11 Oct night: and never wider than the frame. 10 of 34 Try it pages on the free eleven were laid out at a fixed 358 px
// for a whole phone screen; inside a card the frame is about 342 px, so their right edge was cut ("HR / his boss").
const FIT = `<style>html,body{height:auto!important;overflow:auto!important;max-width:100%!important;overflow-x:hidden!important}body>*{height:auto!important;max-height:none!important;overflow:visible!important}body *{max-width:100%!important;box-sizing:border-box!important;min-width:0!important}button{flex-shrink:0!important}</style>`
export function lockDown(html: string, fit = false): string {
  const h = html.replace(/<meta[^>]+content-security-policy[^>]*>/gi, '') + (fit ? FIT : '')
  if (/<head[^>]*>/i.test(h)) return h.replace(/<head[^>]*>/i, (m) => `${m}${CSP}`)
  if (/<html[^>]*>/i.test(h)) return h.replace(/<html[^>]*>/i, (m) => `${m}<head>${CSP}</head>`)
  return `${CSP}${h}`
}
