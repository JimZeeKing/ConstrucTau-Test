const LeftControls = {
  data() {
    return {
      closed: true,
      tree: {
        name: '',
        geomitems: [],
      },
    }
  },
}

const leftControls = Vue.createApp(LeftControls);


leftControls.component('tree-list', {
  props: ['children', 'name', 'level', 'item'],
  data() {
    return {

    }
  },
  methods: {
    toggle(container, event) {
      const chevron = event.currentTarget;
      const containerItem = document.querySelector(`.${container}`);
      const itemsToToggle = containerItem.querySelectorAll("ul");
      itemsToToggle.forEach((itemToToggle) => {
        itemToToggle.classList.toggle("hidden")
      });

      if (chevron.classList.toggle("open")) {

      };
    },
    toggleVisibility(item, event) {
      const element = event.currentTarget;
      element.classList.toggle('visible');
      console.log(item.setVisible(!item.isVisible()));
    }
  },
  template: `
  <ul :class='"list_"+level' class='tree-list'>
    <li>
    <div :class='[{chevron:children},"open"]' @click='toggle("list_"+level, $event)'></div>
      <span @click='toggleVisibility(item, $event)' class='visible'>{{name}}</span>
      <tree-list :level='parseInt(level) + 1 + "i" + index' v-for='(child, index) in children' :children='child.children' :item='child.item' :name='child.name' :key='index'></tree-list>
    </li>
  </ul>
  `
})


const leftControlsApp = leftControls.mount('#left-controls');