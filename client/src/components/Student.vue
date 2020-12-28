<template>
  <div class="student-container">
    <h1>Student</h1>
    <h3>Answer questions posted by the teacher</h3>

    <div v-if="wait" class="name-input">
        <h3>Please enter your name</h3>
        <div class="mt-60"></div>
        <b-form-input v-model="name" placeholder="" class="name"></b-form-input>
        <div class="mt-60"></div>
        <b-button variant="success" @click="start" class="start-btn">Start</b-button>
    </div>

    <div class="mt-60"></div>
    <div v-if="!wait && !isQ">
        <h1>Status</h1>
        <h3>Waiting for a question ...</h3>
    </div>

    <div class="mt-60"></div>
    <div class="answers" v-if="!wait && isQ && !done">
        <div v-if="postedQuestion.qType === 'match'">
            <b-row>
                <b-col cols="9">
                    <h1>Matching Pairs</h1>
                    <h3>Match the left and right sides</h3>
                </b-col>
                <b-col cols="1">
                    <h3>{{ postedQuestion.score }}</h3>
                </b-col>
                <b-col cols="2">
                    <div class="timer">
                        <h3>Time remaining</h3>
                        <h1>{{ timer }}</h1>
                    </div>
                </b-col>
            </b-row>

            <div>
                <b-row class="match-rows" v-for="(q, index) in postedQuestion.qAnswer" :key="q.id">
                    <b-col :class="`left-${index}`">
                        {{ q.left }}
                    </b-col>
                    <b-col>
                        <b-form-select class="match-answer" :options="option" size="md" @change="handleSelect($event, index)" value="null" ></b-form-select>
                    </b-col>
                </b-row>
            </div>
        </div>

        <div v-if="postedQuestion.qType === 'multi'"> 
            <b-row>
                <b-col cols="9">
                    <h1>Multiple Choice</h1>
                </b-col>
                <b-col cols="1">
                    <h3>{{ postedQuestion.score }}</h3>
                </b-col>
                <b-col cols="2">
                    <div class="timer">
                        <h3>Time remaining</h3>
                        <h1>{{ timer }}</h1>
                    </div>
                </b-col>
            </b-row>
            <b-row>
                <h1>{{ postedQuestion.qContent }}</h1>
            </b-row>
            <div class="mt-60"></div>
            <b-row>
                <h3>Select all correct answers</h3>
            </b-row>
            <div class="mt-60"></div>
            <b-row> 
                <b-col cols="4" v-for="(q, index) in postedQuestion.qAnswer" :key="q.id">
                    <b-row>
                        <b-col cols="2">
                            <b-form-checkbox
                                :id="`checkbox-${index}`"
                                :name="`checkbox-${index}`"
                                :value="`${true}`"
                                :unchecked-value="`${false}`"
                                @change="handleCheck(index)"
                            ></b-form-checkbox>
                        </b-col>
                        <b-col cols="10">
                            <div>{{ q.content }}</div>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
        </div>

        <div class="mt-60"></div>
        <div class="submit-answer">
            <b-button variant="success" class="start-btn" :disabled="timer === 0 ? true : false" @click="submitAnswer">Submit answer</b-button>
        </div>
    </div>

    <div class="scoreboard" v-if="done">
      <h3>Results</h3>
      <h1 v-if="isCorrect && !isInCorrect">Correct Answer!</h1>
      <h1 v-if="!isCorrect || isInCorrect" class="incorrect">Incorrect Answer!</h1>
      <div v-if="!isCorrect || isInCorrect" class="correct-answer">
        <h3>The correct answer was:</h3>
        <h2 v-if="!isInCorrect">{{correctAnswer}}</h2>
        <div class="match-correct" v-if="isInCorrect">
          <b-row v-for="a in postedQuestion.qAnswer" :key="a.id">
            <b-col cols="3">{{a.left}}</b-col>
            <b-col cols="1">=</b-col>
            <b-col cols="3">{{a.right}}</b-col>
          </b-row>
        </div>
      </div>
      <div class="mt-60"></div>
      <div class="current-score">
        <div>Your current score</div>
        <h1>{{currentScore}}</h1>
      </div>
    </div>

    <div class="mt-60"></div>
    <div v-if="!wait && !isQ">
        <h1>Leaderboard</h1>
        <h3 v-if="allStudents.length === 0">No scores recorded yet.</h3>
        <div class="students" v-if="allStudents.length !== 0">
          <b-row v-for="student in allStudents" :key="student._id">
            <b-col cols="4">{{student.name}}</b-col>
            <b-col cols="4">{{student.score}}</b-col>
          </b-row>
        </div>
    </div>

  </div>
</template>

<script>

import StudentService from '@/services/StudentService'
import QuestionService from '@/services/QuestionService'
import io from 'socket.io-client'

export default {
  name: 'Student',
  data () {
    return {
      socket: null,
      name: '',
      wait: true,
      isQ: false,
      postedQuestion: '',
      option: [{value: null, text: 'Select Answer'}],
      isCorrect: false,
      isInCorrect: false,
      timer: 0,
      student: '',
      matchAnswers: [],
      done: false,
      correctAnswer: '',
      currentScore: 0,
      allStudents: []
    }
  },
  methods: {
    timeCount: function () {
      let self = this
      let x = setInterval(function () {
        if (self.timer <= 0) {
          clearInterval(x)
        } else {
          self.timer -= 1
        }
      }, 1000)
    },
    start: async function () {
      let student = await StudentService.addStudent({
        name: this.name
      })
      this.$swal(
        'Great!',
        `Your name has been saved!`,
        'success'
      )
      this.student = student.data
      this.wait = false
    },
    socketInit: function () {
      this.socket = io('http://localhost:4000')

      this.socket.on('newQuestion', async id => {
        this.option = [{value: null, text: 'Select Answer'}]
        this.isCorrect = false
        this.isInCorrect = false
        let q = await QuestionService.getQuestionById({
          'id': id
        })
        this.postedQuestion = q.data
        let answers = this.postedQuestion.qAnswer
        answers.map(a => {
          if (a.isCorrect) {
            this.correctAnswer = a.content
          }
        })
        this.isQ = true
        this.done = false
        this.timer = Number(q.data.time)
        // if match, set option
        let tmp = this.postedQuestion.qAnswer
        tmp.map(a => {
          this.option.push({
            value: a.right, text: a.right
          })
        })
        // time count down
        this.timeCount()
      })

      this.socket.on('showAnswers', async param => {
        this.getAllStudent()
      })
    },
    handleCheck: function (index) {
      let checkAnswer = this.postedQuestion.qAnswer[index]
      if (checkAnswer.isCorrect) {
        this.isCorrect = true
      }
    },
    handleSelect: function (ev, id) {
      this.matchAnswers[id] = ev
    },
    submitAnswer: async function () {
      if (this.postedQuestion.qType === 'match') {
        console.log('match compare')
        let self = this
        let answers = this.postedQuestion.qAnswer
        answers.map((a, id) => {
          if (a.right === self.matchAnswers[id]) {
            console.log('same')
            self.isCorrect = true
          } else {
            console.log('not same')
            self.isInCorrect = true
          }
        })
      }

      let score = 0
      if (this.postedQuestion.qType === 'match') {
        score = this.isCorrect && !this.isInCorrect ? this.postedQuestion.score : 0
      } else {
        score = this.isCorrect ? this.postedQuestion.score : 0
      }

      let savedStudent = await StudentService.editStudent({
        id: this.student._id,
        score: score
      })

      this.currentScore = savedStudent.data.score

      this.done = true
      this.isQ = false

      let flag = true
      if (score === 0) {
        flag = false
      }
      let data = {id: this.student._id, isCorrect: flag}
      this.socket.emit('submitAnswer', data)
      this.getAllStudent()
    },
    getAllStudent: async function () {
      let tmp = await StudentService.getAllStudents()
      this.allStudents = tmp.data.students
    }
  },
  mounted () {
    this.socketInit()
    this.getAllStudent()
  }
}
</script>

<style type="text/css">
    .mt-60 {
        margin-top:60px;
    }

    .name-input {
        margin-top: 50px;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 30px;
        text-align: center;
    }

    .name {
        width: 50%;
        margin: 0 auto;
    }

    .start-btn {
        width: 20% !important;
    }

    .answers {
        border: 1px solid #ddd;
        border-radius: 5px;
        box-shadow: 1px 1px 10px #ddd;
        padding: 30px;
        font-size: 25px;
    }

    .scoreboard {
      border: 1px solid #ddd;
      border-radius: 5px;
      box-shadow: 1px 1px 10px #ddd;
      padding: 30px;
      text-align: center;
    }

    .current-score {
      border: 1px solid #ddd;
      border-radius: 5px;
      width: 35%;
      margin: 0 auto;
      padding: 30px;
    }

    .match-rows {
        margin: 30px 0px;
    }

    .match-rows div:first-child {
        border-right: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        padding: 10px;
    }

    .match-rows div:last-child {
        border-bottom: 1px solid #ddd;
        padding: 10px;
    }

    .match-answer {
        width: 80%;
        float: right;
    }

    .submit-answer {
        text-align: center;
    }

    .timer {
        border: 1px solid #ddd;
        padding: 10px;
        border-radius: 5px;
        text-align: center;
        width: 75%;
    }

    .incorrect {
      color: red;
    }

    .correct-answer {
      margin-top: 50px;
    }

    .students {
      font-size: 25px;
    }

    .match-correct {
      margin-left: 30%;
      margin-top: 30px;
      margin-bottom: 30px;
    }

    .match-correct > div {
      margin-top: 20px;
      margin-bottom: 20px;
    }
</style>