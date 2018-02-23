// @format

console.log('hello from content.js')

const { h, app } = hyperapp

const fetchLinks = () => {
  let links = []

  // Gather links
  $('a').each((i, el) => {
    links.push(el.href)
  })

  $('img').each((i, el) => {
    links.push(el.src)
  })

  return links
}

const extractUrls = links => {
  const imageUrls = links.map(url => {
    if (url.match(db.match)) {
      return url.replace(db.match, db.replace)
    }

    if (url.match(yt.match)) {
      return url.replace(yt.match, yt.replace)
    }

    if (url.match(ph.match)) {
      return url.replace(ph.match, ph.replace)
    }

    return null
  })

  const images = imageUrls.filter(url => url !== null)

  return images
}

const state = {
  zoomed: true,
  current: 0,
  images: [],
}

const actions = {
  toggleZoom: () => state => ({ zoomed: !state.zoomed }),
  back: () => state => ({ current: Math.max(state.current - 1, 0) }),
  next: () => state => ({
    current: Math.min(state.current + 1, state.images.length - 1),
  }),
}

const view = (state, actions) =>
  h('div', {}, [
    h('div', { class: 'toolbar' }, [
      h('span', { class: 'toolbar-item' }, 'Full'),
      h('span', { class: 'toolbar-item' }, 'All'),
      h('span', { class: 'toolbar-item', onclick: actions.back }, 'Back'),
      h('span', { class: 'toolbar-item', onclick: actions.next }, 'Next'),
      h('span', { class: 'toolbar-item' }, 'Close'),
    ]),
    h('div', { class: 'backdrop' }, [
      h('img', {
        class: state.zoomed ? 'zoom-in' : 'no-zoom',
        onclick: () => actions.toggleZoom(),
        src: state.images[state.current],
      }),
    ]),
  ])

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'clicked_browser_action') {
    $(document.body).prepend('<div class="ex" />')

    const links = fetchLinks()
    const images = extractUrls(links)
    const ex = app({ ...state, images }, actions, view, $('.ex')[0])

    document.addEventListener('keydown', function(event) {
      if (event.keyCode == 37) {
        ex.back()
      }

      if (event.keyCode == 39) {
        ex.next()
      }
    })
  }
})

const db = {
  match: /(.+)_t\.jpg/,
  replace: '$1.jpg',
}

const yt = {
  match: /(.+)small(.+)/,
  replace: '$1big$2',
}

const ph = {
  match: /(.+)thumbs(.+)/,
  replace: '$1images$2',
}
