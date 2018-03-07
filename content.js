// @format

const { h, app } = hyperapp

console.log('hello from content.js')

const state = {
  zoomed: true,
  current: 0,
  playing: false,
  intervalId: null,
  images: [],
}

const actions = {
  close: () => state => $('#ex').remove(),
  toggleZoom: () => state => ({ zoomed: !state.zoomed }),
  back: () => state => ({ current: Math.max(state.current - 1, 0) }),
  next: () => state => ({
    current: Math.min(state.current + 1, state.images.length - 1),
  }),
  setCurrent: i => state => ({ current: i }),
  playPause: () => (state, actions) =>
    state.playing ? actions.pause() : actions.play(),
  play: () => (state, actions) => {
    const id = setInterval(actions.next, 1000)
    return {
      playing: true,
      intervalId: id,
    }
  },
  pause: () => (state, actions) => {
    clearInterval(state.intervalId)
    return {
      playing: false,
      intervalId: null,
    }
  },
}

const view = (state, actions) =>
  h('div', {}, [
    h('div', { class: 'toolbar' }, [
      h('span', { class: 'toolbar-item' }, 'Full'),
      h('span', { class: 'toolbar-item' }, 'All'),
      h('span', { class: 'toolbar-item', onclick: actions.play }, 'Play'),
      h('span', { class: 'toolbar-item', onclick: actions.back }, 'Back'),
      h('span', { class: 'toolbar-item', onclick: actions.next }, 'Next'),
      h('span', { class: 'toolbar-item', onclick: actions.close }, 'Close'),
    ]),
    h('div', { class: 'backdrop' }, [
      h('img', {
        class: state.zoomed ? 'zoom-in' : 'no-zoom',
        onclick: () => actions.toggleZoom(),
        src: state.images[state.current],
      }),
    ]),
    h(
      'div',
      { class: 'thumbnails' },
      state.images.map((image, i) =>
        h('img', {
          class: `thumbnail ${i === state.current ? 'active' : ''}`,
          onclick: () => actions.setCurrent(i),
          'data-src': image,
        }),
      ),
    ),
  ])

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'clicked_browser_action') {
    console.log('taking off...')
    main()
  }
})

const main = () => {
  $(document.body).prepend('<div id="ex" />')

  const links = fetchLinks()
  const images = extractUrls(links)
  const ex = app({ ...state, images }, actions, view, $('#ex')[0])

  document.addEventListener('keydown', function(event) {
    if (event.keyCode == 37) {
      ex.back()
    }

    if (event.keyCode == 39) {
      ex.next()
    }

    if (event.keyCode == 32) {
      event.preventDefault()
      ex.playPause()
    }
  })

  $(document).ready(() => $('img').unveil())
}

const fetchLinks = () => {
  let links = []
  $('a').each((i, el) => links.push(el.href))
  $('img').each((i, el) => links.push(el.src))
  return links
}

const extractUrls = links => {
  const images = links
    .map(url => {
      if (url.match(db.match)) {
        return url.replace(db.match, db.replace)
      }

      if (url.match(yt.match)) {
        return url.replace(yt.match, yt.replace)
      }

      if (url.match(ph.match)) {
        return url.replace(ph.match, ph.replace)
      }

      if (url.match(ig.match)) {
        return url.replace(ig.match, ig.replace)
      }

      return null
    })
    .filter(url => url !== null)

  return images
}

const ig = {
  match: /(.+)\.jpg/,
  replace: '$1.jpg',
}

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
