const LeftControls = {
  data() {
    return {
      tree: {
        name: 'test',
        geomitems: [
          {
            id: 1,
            name: 'test',
          },
        ],
      },
    }
  },
}

const leftControls = Vue.createApp(LeftControls).mount('#left-controls')
