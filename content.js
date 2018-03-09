// @format

const { h, app } = hyperapp

console.log('hello from content.js')

const playSpeed = {
  SLOW: 3000,
  NORMAL: 1000,
  FAST: 500,
}

const state = {
  zoomed: true,
  current: 0,
  playing: false,
  playSpeed: playSpeed.NORMAL,
  intervalId: null,
  images: [],
}

const actions = {
  close: () => state => $('#ex').remove(),
  toggleZoom: () => state => ({ zoomed: !state.zoomed }),
  zoomOut: () => state => ({ zoomed: true }),
  back: () => (state, actions) => {
    actions.pause()
    actions.setCurrent(Math.max(state.current - 1, 0))
  },
  next: () => (state, actions) => {
    actions.setCurrent(Math.min(state.current + 1, state.images.length - 1))
  },
  setCurrent: i => (state, actions) => {
    actions.zoomOut()
    return { current: i }
  },
  playPause: () => (state, actions) =>
    state.playing ? actions.pause() : actions.play(),
  play: () => (state, actions) => {
    const intervalId = setInterval(actions.next, state.playSpeed)
    return {
      playing: true,
      intervalId,
    }
  },
  pause: () => (state, actions) => {
    clearInterval(state.intervalId)
    return {
      playing: false,
      intervalId: null,
    }
  },
  setSpeed: playSpeed => (state, actions) => {
    return {
      playSpeed,
    }
  },
}

const view = (state, actions) =>
  h('div', {}, [
    h('div', { class: 'toolbar' }, [
      h('span', { class: 'toolbar-item' }, 'Full'),
      h('span', { class: 'toolbar-item' }, 'All'),
      h('span', { class: 'toolbar-item', onclick: actions.play }, 'Play'),
      h('span', { class: 'toolbar-item', onclick: actions.pause }, 'Pause'),
      h(
        'span',
        {
          class: 'toolbar-item',
          onclick: () => {
            actions.pause()
            actions.setSpeed(playSpeed.SLOW)
            actions.play()
          },
        },
        'Slow',
      ),
      h(
        'span',
        {
          class: 'toolbar-item',
          onclick: () => {
            actions.pause()
            actions.setSpeed(playSpeed.NORMAL)
            actions.play()
          },
        },
        'Normal',
      ),
      h(
        'span',
        {
          class: 'toolbar-item',
          onclick: () => {
            actions.pause()
            actions.setSpeed(playSpeed.FAST)
            actions.play()
          },
        },
        'Fast',
      ),
      h('span', { class: 'toolbar-item', onclick: actions.back }, 'Back'),
      h('span', { class: 'toolbar-item', onclick: actions.next }, 'Next'),
      h('span', { class: 'toolbar-item', onclick: actions.close }, 'Close'),
    ]),
    h('div', { class: 'backdrop' }, [
      h('img', {
        class: `poster ${state.zoomed ? 'zoom-in' : 'no-zoom'}`,
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
    main()
  }
})

const main = () => {
  const links = fetchLinks()
  $(document.body).empty()
  $(document.body).prepend('<div id="ex" />')

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
      for (i in matchers) {
        const matcher = matchers[i]
        if (url.match(matcher.match)) {
          return url.replace(matcher.match, matcher.replace)
        }
      }

      return null
    })
    .filter(url => url !== null)

  return images
}

const matchers = [
  {
    match: /(.+)b\.jpg/,
    replace: '$1.jpg',
  },

  {
    match: /(.+)_t\.jpg/,
    replace: '$1.jpg',
  },

  {
    match: /(.+)small(.+)/,
    replace: '$1big$2',
  },

  {
    match: /(.+)thumbs(.+)/,
    replace: '$1images$2',
  },
]
