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

      if (chevron.classList.toggle('open')) {
      }
    },
    getParentList(startingNode) {
      let parentList = startingNode.parentNode
      while (!(parentList instanceof HTMLUListElement)) {
        parentList = parentList.parentNode
      }
      return parentList
    },
    toggleVisibility(item, children, event) {
      item.shouldBeVisible = !item.shouldBeVisible
      const element = event.currentTarget
      element.classList.toggle('visible')
      element.classList.toggle('invisible')

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

      let parentList = this.getParentList(element)
      const allChildElements = parentList.querySelectorAll('span')
      allChildElements.forEach((span, index) => {
        if (index > 0) {
          if (!item.isVisible()) {
            span.classList.add('parentHidden')
          } else {
            span.classList.remove('parentHidden')
          }
        }
      })
      const allInvisible = parentList.querySelectorAll('span.invisible')
      allInvisible.forEach((span) => {
        const spanParent = this.getParentList(span)
        spanParent.querySelectorAll('span').forEach((spanTohide, index) => {
          if (index > 0) {
            spanTohide.classList.add('parentHidden')
          }
        })
      })
    },
  },
  template: `
  <ul :class='"list_"+level' class='tree-list'>
    <li>
    <div :class='[{chevron:children},"open"]' @click='toggle("list_"+level, $event)'></div>
      <span @click='toggleVisibility(item, children, $event)' class='visible' >{{name}}</span>
      <tree-list :level='parseInt(level) + 1 + "i" + index' v-for='(child, index) in children' :children='child.children' :item='child.item' :name='child.name' :key='index'></tree-list>
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
      window.gotoPosition(positionIndex);
    }
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
