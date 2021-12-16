const LeftControls = {
  data() {
    return {
      closed: true,
      quizReady: false,
      quizReadyCallback: null,
      treeListSearchCallback: null,
      currentPage: 0,
      pages: [{ title: 'Éléments' }, { title: 'Positions' }],
      positions: [],
      tree: {
        name: '',
        geomitems: [],
      },
    }
  },
  methods: {},
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

      /* itemsToToggle.forEach((itemToToggle) => {
         itemToToggle.classList.toggle('hidden')
       })*/

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
    toggleAllSiblingsExceptMe(listName, event) {
      const element = event.currentTarget
      console.log(`.${listName} > li > span`)
      const siblingElements = document.querySelectorAll(`.${listName} > li > span`)
      console.log(siblingElements)
      siblingElements.forEach((siblingElement) => {
        if (siblingElement != element) {
          siblingElement.click()
        }
      })
    },
    hideLastChildren() {
      const allLastChildren = document.querySelectorAll('span.last')
      allLastChildren.forEach((child) => {
        child.textContent = '????????'
      })
    },
  },
  created() {
    let self = this


    this.$root.treeListSearchCallback = (itemName) => {
      const rootList = document.querySelector(".list_0i0");

      const allSpans = rootList.querySelectorAll('span');
      allSpans.forEach(span => {
        if (span.innerText == itemName) {
          const parentList = this.getParentList(span);


          if (parentList && parentList.classList.contains("hidden")) {

            const listIndex = parentList.dataset.index;

            const chevronParent = this.getParentList(parentList);
            console.log(chevronParent);
            document.querySelector(`#${chevronParent.id} li:nth-child(${parseInt(listIndex) + 1}) > .chevron`).click();
          };

          span.classList.add("selected");

          if (parentList) parentList.scrollIntoView(false);
          else span.scrollIntoView(false);

        } else span.classList.remove("selected");
      });
    }

    this.$root.unselectAll = function () {
      document.querySelectorAll("span.selected").forEach(span => span.classList.remove("selected"))
    }

    this.$root.quizReadyCallback = (quiz) => {
      if (quiz.isSom) {
        self.hideLastChildren()
      }
    }
  },
  template: `
  <ul :id='"list_"+level' :class='"list_"+level' class='tree-list visible'>
    <li v-for='(child, index) in children'>
    <div  :class='[{chevron:child.children},"open"]' @click='toggle("list_"+level+(parseInt(level) + 1) + "i" + index, $event)'></div>
      <span :class='{last:child.children == undefined}' @click='toggleVisibility(child.item, child.children,level+(parseInt(level) + 1)+ "i" + index, $event)' class='item-visible' @contextmenu="toggleAllSiblingsExceptMe('list_'+level, $event)" >{{child.name}}</span>
      <template v-if="child.children">
        <tree-list :data-index='index' :level='level+(parseInt(level) + 1) + "i" + index'  :children='child.children' :item='child.item' :name='child.name' :key='child.name'></tree-list>
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

leftControls.component('quiz', {
  data() {
    return {
      fetching: false,

      quizAPI: {
        /*  get: 'http://localhost:3000/quiz/nocred/',
          save: 'http://localhost:3000/quiz/save/',*/
        save: 'https://tim.cgmatane.qc.ca:3000/quiz/save',
        get: 'https://tim.cgmatane.qc.ca:3000/quiz/nocred/',
      },
      quiz: null,
      saved: false,
      shouldEnterInfos: false,
      shouldSeeAnswers: false,
      shouldAppear: false,
      user: {
        firstname: '',
        lastname: '',
      },
      savedAnswers: [],
    }
  },
  methods: {
    saveLocalData(key, data) {
      localStorage.setItem(key, JSON.stringify(data))
    },
    loadLocalData(key) {
      return JSON.parse(localStorage.getItem(key))
    },
    clearLocalData() {
      localStorage.clear()
    },
    setAnswer: function (question, answer) {
      question.userans = answer
      question.dirty = true
      this.saveLocalData('quiz', this.quiz)
    },
    setAnswerMultiple: function (question, answer) {
      const foundChoiceIndex = question.userans.indexOf ? question.userans.indexOf(answer) : -1

      if (question.userans == -1) {
        question.userans = [answer]
      } else if (foundChoiceIndex == -1) {
        question.userans.push(answer)
      } else {
        question.userans.splice(foundChoiceIndex, 1)
      }
      question.dirty = question.userans.length > 0

      this.saveLocalData('quiz', this.quiz)
    },
    checkMultipleExist(question, answer) {
      return question.userans.includes ? question.userans.includes(answer) : false
    },
    grabOpenAnswer(question, event) {
      const value = event.target.value
      if (value != '') {
        this.setAnswer(question, value)
      } else question.dirty = false
    },
    radioButtonName(index, prefix) {
      return prefix + index
    },
    saveQuizData() {
      if (this.quiz.isSom) {
        this.quiz.questions.map((question, index) => {
          this.savedAnswers.push({ index: index, good: question.ans == question.userans, ans: question.userans })
        })
        this.shouldEnterInfos = true
      } else this.showQuizData()
    },
    getPreviousQuestion() {
      this.quiz.currentQuestionIndex--
    },
    getNextQuestion() {
      this.quiz.currentQuestionIndex++
    },
    fullImagePath(src) {
      return this.quizAPI.images + src
    },
    currentImageAnswer(question, src) {
      return question.userans == src
    },
    sendQuizData() {
      const data = { user: this.user, answers: this.savedAnswers, quizID: this.quiz.id }
      fetch(this.quizAPI.save, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status == 200) {
            return response.json()
          } else return null
        })
        .then((json) => {
          if (json != null) {
            this.user.firstname = ''
            this.user.lastname = ''
            this.saved = true
            this.savedAnswers = []

            this.clearLocalData()
          }
        })
    },

    showQuizData() {
      this.savedAnswers = []
      this.quiz.questions.map((question, index) => {
        switch (question.type) {
          case 'choicesm':
            let good = question.userans.length == question.ans.length
            if (good)
              for (var i = 0; i < question.ans.length; i++) {
                if (!question.userans.includes(question.ans[i])) {
                  good = false
                  break
                }
              }

            this.savedAnswers.push({ index: index, good: good, ans: question.userans, type: question.type })
            break

          case 'open':
            this.savedAnswers.push({ index: index, good: question.choices.indexOf(question.userans) != -1, ans: question.userans, type: question.type, goodAnswers: question.choices })
            break

          default:
            this.savedAnswers.push({ index: index, good: question.ans == question.userans, ans: question.userans, type: question.type })
            break
        }
      })
      this.shouldSeeAnswers = true
    },
    fetchQuizData(quizID) {
      console.log(this.quizAPI.get + quizID)

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
            alert('ERROR')
          } else {
            json.currentQuestionIndex = 0
            this.quiz = json

            if (this.$root.quizReadyCallback) {
              this.$root.quizReadyCallback(this.quiz)
            }

            console.log(this.quiz)
            /* const localData = this.loadLocalData('quiz')
            if (localData && localData.id == this.quiz.id) {
              this.quiz.questions = localData.questions
            }*/
          }
          this.isFetching = false
        })
    },
    gotToQuestion(index, closeAnswers) {
      if (closeAnswers) {
        this.shouldSeeAnswers = false
        this.shouldAppear = true
      }
      this.quiz.currentQuestionIndex = index
    },
  },
  computed: {
    allDirty() {
      return (
        this.quiz.questions.filter((question) => {
          return question.dirty == true
        }).length == this.quiz.questions.length
      )
    },
    getCurrentQuestion() {
      return this.quiz.questions.filter((question, index) => {
        return index == this.quiz.currentQuestionIndex
      })
    },
    hasPreviousQuestion() {
      return this.quiz.currentQuestionIndex > 0
    },
    hasNextQuestion() {
      return this.quiz.currentQuestionIndex < this.quiz.questions.length - 1
    },
    submitLabel() {
      return this.allDirty ? (this.quiz.isSom ? 'Soumettre le quiz' : 'Voir les résultats') : 'Quiz non complété'
    },
    APIMessage() {
      return false
    },
    goodAnswersCount() {
      return this.savedAnswers.filter((savedAnswer) => {
        return savedAnswer.good
      }).length
    },
  },
  created() {
    const params = new URLSearchParams(window.location.search)
    if (params.has('quiz')) {
      const quizID = params.get('quiz')
      this.fetchQuizData(quizID)
    }
  },
  template: `
  <div class="quiz" v-if="quiz != null" :class="{active:(shouldAppear && !shouldEnterInfos && !shouldSeeAnswers)}">
  <div class="trigger" @click="shouldEnterInfos || shouldSeeAnswers ? null : shouldAppear = !shouldAppear" :title="!shouldAppear ? 'Afficher le quiz':'Cacher le quiz'">
  <div class="icon"></div>
</div>
      <h2>{{quiz.title}}</h2>
      <div class="quiz-infos" :class="{hidden:!shouldEnterInfos}">
        <h3>Transmission des réponses<button title="fermer la fenêtre" class="close-button" v-if="!saved"
            @click="shouldEnterInfos = !shouldEnterInfos">&gt; Revenir au quiz</button></h3>

        <h4>Veuillez inscrire votre prénom et nom afin de pouvoir envoyer vos réponses. <br> </h4>
        <h5 class="message" v-if="APIMessage">{{APIMessage}}</h5>
        <div v-if="!saved" class="form">
          <label for="firstname">
            <div class="label-string"> Prénom: </div>
            <input v-model="user.firstname" type="text" name="firstname" id="firstname">
          </label>
          <label for="lastname">
            <div class="label-string"> Nom: </div>
            <input v-model="user.lastname" type="text" name="lastname" id="lastname">
          </label>
          <div class="footer">
            <button @click="sendQuizData" :disabled="!user.lastname || !user.firstname">Envoyer</button>
            <em v-if="user.lastname && user.firstname">Notez qu'il ne
              sera plus possible de modifier vos réponses, une fois celles-ci transmises au serveur.</em>
          </div>

        </div>
      </div>
      <div class="quiz-infos answers" :class="{hidden:!shouldSeeAnswers}">
        <h3>Résultats : {{goodAnswersCount}}/{{savedAnswers.length}}
          ({{goodAnswersCount/savedAnswers.length*100}}%)<button title="fermer la fenêtre" class="close-button"
            v-if="!saved" @click="shouldSeeAnswers = !shouldSeeAnswers">&gt; Revenir au
            quiz</button></h3>

        <ul>
          <li v-for="savedAnswer in savedAnswers" :key="savedAnswer.index">
            <article title="Retourner à la question" @click="gotToQuestion(savedAnswer.index, true)"
              :class="{wrong:!savedAnswer.good}">
              <div>
                <p>Q#{{savedAnswer.index + 1}} : {{quiz.questions[savedAnswer.index].str}}</p>
                <p v-if="savedAnswer.type == 'open' && !savedAnswer.good">Réponses valides : {{savedAnswer.goodAnswers}}
                </p>
              </div>


            </article>
          </li>
        </ul>

      </div>
      <div class="question-container" v-for="question in getCurrentQuestion" :key="question.id">
        <h3>Question {{quiz.currentQuestionIndex + 1}} de {{quiz.questions.length}}</h3>
        <div class="question" v-if="question.type == 'truefalse'">
          <h4>{{question.str}}</h4>
          <div class="answers col">
            <label :for="radioButtonName(question.id,'a1q')">
              <div class="label-string"> Vrai: </div>
              <input type="radio" :checked="question.dirty && question.userans == true"
                :id="radioButtonName(question.id,'a1q')" :name="radioButtonName(question.id, 'q')"
                @click="setAnswer(question, true)">
            </label>
            <label :for="radioButtonName(question.id,'a2q')">
              <div class="label-string"> Faux: </div>
              <input type="radio" :checked="question.dirty && question.userans == false"
                :id="radioButtonName(question.id,'a2q')" :name="radioButtonName(question.id, 'q')"
                @click="setAnswer(question, false)">
            </label>
          </div>
        </div>
        <div class="question" v-else-if="question.type == 'choices'">
          <h4>{{question.str}}</h4>
          <div class="answers col">
            <label v-for="(choice, index) in question.choices" :for="radioButtonName(question.id,'aq' + index)">
              <div class="label-string"> {{choice}}: </div>
              <input type="radio" :checked="question.dirty && question.userans == choice"
                :id="radioButtonName(question.id,'aq' + index)" :name="radioButtonName(question.id, 'q')"
                @click="setAnswer(question, choice)">
            </label>

          </div>
        </div>
        <div class="question" v-else-if="question.type == 'open'">
          <h4>{{question.str}}</h4>
          <div class="answers col">
            <label class="open" :for="radioButtonName(question.id,'aq' + question.id)">
              <div class="label-string"> > </div>
              <input type="text" placeholder="Inscrire la réponse" :value="question.dirty ? question.userans : ''"
                :id="radioButtonName(question.id,'aq' + question.id)" :name="radioButtonName(question.id, 'q')"
                @input="grabOpenAnswer(question, $event)">
            </label>
          </div>
        </div>
        <div class="question" v-else-if="question.type == 'images'">
          <h4>{{question.str}}</h4>
          <div class="answers col">
            <ul>
              <li :class="{selected:currentImageAnswer(question, choice)}" v-for="(choice, index) in question.choices"
                @click="setAnswer(question, choice, true)">
                <img :src="choice">
              </li>
            </ul>


          </div>
        </div>
        <div class="question" v-else-if="question.type == 'choicesm'">
          <h4>{{question.str}}</h4>
          <div class="answers col">
            <label v-for="(choice, index) in question.choices" :for="radioButtonName(question.id + '' + index, 'q')">
              <div class="label-string"> {{choice}}: </div>
              <input type="checkbox" :checked="question.dirty && checkMultipleExist(question, choice)"
                :id="radioButtonName(question.id + '' + index, 'q')"
                :name="radioButtonName(question.id + '' + index, 'q')" @click="setAnswerMultiple(question, choice)">
            </label>

          </div>
        </div>
      </div>
      <div class="buttons-next-prev">
        <button title="Question précédente" @click="getPreviousQuestion" :disabled="!hasPreviousQuestion">&lt;</button>
        <button title="Question suivante" @click="getNextQuestion" :disabled="!hasNextQuestion">&gt;</button>
      </div>

      <button :disabled="!allDirty" @click="saveQuizData">{{submitLabel}}</button>
    </div>
  `,
})

const leftControlsApp = leftControls.mount('#left-controls')
