const LeftControls = {
  data() {
    return {
      closed: true,
      currentPage: 0,
      pages: [{ title: 'Éléments' }, { title: 'Positions' }],
      positions: [],
      tree: {
        name: '',
        geomitems: [],
      },
      fetching: false,
      quizAPI: {
        get: 'http://localhost:3000/quiz/nocred/',
        save: 'http://localhost:3000/quiz/save/',
        /*save: "https://tim.cgmatane.qc.ca:3000/quiz/save",
        get: "https://tim.cgmatane.qc.ca:3000/quiz/nocred/"*/
      },
      quiz: {},
    }
  },
  methods: {
    fetchQuizData(quizID) {
      console.log(this.quizAPI.get + quizID)
      this.fetching = true
      fetch(this.quizAPI.get + quizID, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          return response.json()
        })
        .then((json) => {
          if (json.error) {
            alert(123)
          } else {
            json.currentQuestionIndex = 0
            this.quiz = json
          }
          this.fetching = false
        })
    },
  },
  created() {
    const params = new URLSearchParams(window.location.search)
    if (params.has('quiz')) {
      const quizID = params.get('quiz')
      this.fetchQuizData(quizID)
    }
  },
}

const leftControls = Vue.createApp(LeftControls)

leftControls.component('tree-list', {
  props: ['children', 'name', 'level', 'item'],
  data() {
    return {}
  },
  methods: {
    toggle(container, event) {
      const chevron = event.currentTarget
      const containerItem = document.querySelector(`.${container}`)
      const itemsToToggle = containerItem.querySelectorAll('ul')
      itemsToToggle.forEach((itemToToggle) => {
        itemToToggle.classList.toggle('hidden')
      })

      containerItem.classList.toggle('hidden')
      chevron.classList.toggle('open')
    },
    getParentList(startingNode) {
      let parentList = startingNode.parentNode

      if (parentList == null) {
        return parentList
      }
      while (parentList && !(parentList instanceof HTMLUListElement)) {
        parentList = parentList.parentNode
      }
      return parentList
    },

    toggleVisibility(item, children, listName, event) {
      item.shouldBeVisible = !item.shouldBeVisible
      const element = event.currentTarget

      let parentList = document.querySelector(`.list_${listName}`)

      element.classList.toggle('item-visible')
      element.classList.toggle('item-invisible')
      if (parentList) {
        parentList.classList.toggle('visible')
        parentList.classList.toggle('invisible')
      }

      const childrenToKeepHidden = []
      if (item.shouldBeVisible && children) {
        children.forEach((child) => {
          if (!child.item.isVisible() && !child.item.shouldBeVisible) {
            childrenToKeepHidden.push(child)
          }
        })
      }

      item.setVisible(item.shouldBeVisible)

      childrenToKeepHidden.forEach((child) => {
        child.item.setVisible(false)
      })
    },
  },
  template: `
  <ul :class='"list_"+level' class='tree-list visible'>
    <li v-for='(child, index) in children'>
    <div  :class='[{chevron:child.children},"open"]' @click='toggle("list_"+(parseInt(level) + 1) + "i" + index, $event)'></div>
      <span @click='toggleVisibility(child.item, child.children,parseInt(level) + 1 + "i" + index, $event)' class='item-visible' >{{child.name}}</span>
      <template v-if="child.children">
        <tree-list :level='parseInt(level) + 1 + "i" + index'  :children='child.children' :item='child.item' :name='child.name' :key='child.name'></tree-list>
      </template>    
    </li>
  </ul>
  `,
})

leftControls.component('positions-list', {
  props: ['positions'],
  data() {
    return {}
  },
  methods: {
    gotoPosition(positionIndex) {
      window.gotoPosition(positionIndex)
    },
  },
  template: `
  <ul class='positions-list'>
    <li @click='gotoPosition(index)' v-for='(position, index) in positions'>
    {{position.name}}
    </li>
  </ul>
  `,
})

const leftControlsApp = leftControls.mount('#left-controls')
