// @format

const { h, app } = hyperapp

console.log('hello from content.js')

const state = {
  zoomed: true,
  current: 0,
  images: [
    'https://images.unsplash.com/photo-1495572050486-a9b739c11fb9?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=7ed8945979820790676347b7c6b75174&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=af611c47b827d67c95ce012231e8d02f&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2ebe04dfc7c0713079bd12e06d35ddec&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1499865375034-7cccc6d92a18?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d85b7e9ebb11067e6ccc2249374cfaa1&auto=format&fit=crop&w=800&q=60',
    'https://images.unsplash.com/photo-1507963901243-ebfaecd5f2f4?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8f1afdd53eeeeebe1d5fe866294c6da9&auto=format&fit=crop&w=800&q=60',
  ],
}

const actions = {
  toggleZoom: () => state => ({ zoomed: !state.zoomed }),
  back: () => state => ({ current: state.current - 1 }),
  next: () => state => ({ current: state.current + 1 }),
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
        class: state.zoomed ? 'zoom-in' : '',
        onclick: () => actions.toggleZoom(),
        src: state.images[state.current],
      }),
    ]),
  ])

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'clicked_browser_action') {
    $(document.body).prepend('<div class="ex" />')
    app(state, actions, view, $('.ex')[0])
  }
})
