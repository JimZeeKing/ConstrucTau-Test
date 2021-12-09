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
    getParentList(startingNode) {
      let parentList = startingNode.parentNode;
      while (!(parentList instanceof HTMLUListElement)) {
        parentList = parentList.parentNode;
      }
      return parentList;
    },
    toggleVisibility(item, children, event) {
      console.log(item.isVisible(), item.shouldBeVisible);
      let visibility = item.shouldBeVisible;
      let nextVisibleState = !visibility;
      item.shouldBeVisible = nextVisibleState;
      const element = event.currentTarget;
      element.classList.toggle('visible');
      const tree = element.nextSibling.nextSibling;

      let parentList = this.getParentList(element);

      let parentItem = item.getOwner();

      this.visible = nextVisibleState;

      /* if (nextVisibleState == true && parentItem && !parentItem.isVisible()) {
         console.log('parent is still not visible');
         nextVisibleState = true;
       }*/
      const childrenToKeepHidden = [];
      if (nextVisibleState && children) {
        children.forEach((child) => {
          console.log(child.name, child.item.isVisible());
          if (!child.item.isVisible() && !child.item.shouldBeVisible) {
            childrenToKeepHidden.push(child);
          };

        })
      };
      item.setVisible(nextVisibleState);


      childrenToKeepHidden.forEach(child => {
        child.item.setVisible(false);
      });

      /* if (parentList) {
         parentList.querySelectorAll("span").forEach((span, index) => {
           if (index > 0) {
             if (visibility) {
               span.classList.add('parentHidden');
               if (children) {
                 children.forEach((child) => {
                   this.toggleVisibility(child.item, child.children, event);
                 })
               };
             } else {
               span.classList.remove('parentHidden');
               if (children) {
                 children.forEach((child) => {
                   this.toggleVisibility(child.item, child.children, event);
                 })
               };
             }
           };
         });
       };*/


      //  console.log(nextVisibleState);


    }
  },
  template: `
  <ul :class='"list_"+level' class='tree-list'>
    <li>
    <div :class='[{chevron:children},"open"]' @click='toggle("list_"+level, $event)'></div>
      <span @click='toggleVisibility(item, children, $event)' class='visible' >{{name}}</span>
      <tree-list :level='parseInt(level) + 1 + "i" + index' v-for='(child, index) in children' :children='child.children' :item='child.item' :name='child.name' :key='index'></tree-list>
    </li>
  </ul>
  `
})


const leftControlsApp = leftControls.mount('#left-controls');