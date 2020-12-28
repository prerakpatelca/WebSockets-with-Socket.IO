<template>
    <div class="teacher-container">
        <h1 class="title">Teacher</h1>
        <br />
        <div v-if="!scoreBoard">
            <h4 class="sub-title mb-3">Post a questiont to students</h4>
            <b-row>
                    <b-col cols="4">
                            <b-form-select v-model="qTypeSelected" :options="options" size="md" @change="getQType"></b-form-select>
                    </b-col>
                    <b-col cols="3">
                            <b-form-input v-model="score" placeholder="Score"></b-form-input>
                    </b-col>
                    <b-col cols="2">
                            <b-form-input v-model="time" placeholder="Time" min="10" max="90" @focus="timerSelected = true"></b-form-input>
                            <b-row v-if="timerSelected">
                                    <b-col></b-col>
                                    <b-col></b-col>
                                    <b-col>
                                        <b-form-input v-model="time" type="range" min="10" max="90" class="mt-3" step="5" @blur="timerSelected = false"></b-form-input>
                                    </b-col>
                            </b-row>
                    </b-col>
            </b-row>

            <div v-if="qTypeSelected == 'multi'">
                <b-row>
                <b-col cols="7">
                <h4 class="sub-title mt-3">Multiple Choice</h4>
                </b-col>

                <b-col cols="7">
                    <b-form-textarea
                        id="textarea"
                        v-model="qContent"
                        placeholder="What is the question?"
                        rows="3"
                        max-rows="6"
                    ></b-form-textarea>
                </b-col>
                </b-row>

                <h4 class="sub-title mt-3">Answers</h4>
                <div v-for="(answer, index) in answers" :key = "answer.id">                    
                    <b-row class="mt-3">
                        <b-col cols="1">
                            <b-form-checkbox
                                :id="`checkbox-${index}`"
                                v-model="answer.isCorrect"
                                :name="`checkbox-${index}`"
                                value="true"
                                unchecked-value="false"
                            ></b-form-checkbox>
                        </b-col>
                        <b-col cols="6">
                            <b-form-input v-model="answer.content"></b-form-input>
                        </b-col>
                        <b-col cols="7" class="mt-3 add_answer">
                            <b-button variant="outline-primary" @click="add_answer">Add</b-button>
                        </b-col>
                    </b-row>
                </div>
            </div>

            <div v-if="qTypeSelected == 'match'">
                <h4 class="sub-title mt-3">Matching Pairs</h4>
                <b-row class="mt-3" v-for="match in matches" :key="match.id">
                    <b-col cols="3">
                        <b-form-input v-model="match.left" placeholder=""></b-form-input>
                    </b-col>
                    =
                    <b-col cols="3">
                        <b-form-input v-model="match.right" placeholder=""></b-form-input>
                    </b-col>
                    <b-row>
                        <b-col cols="4"></b-col>
                        <b-col cols="2">
                            <b-button variant="outline-primary" @click="add_match">Add</b-button>
                        </b-col>
                    </b-row>
                </b-row>
            </div>

            <b-row class="mt-3">
                <b-col cols="9"></b-col>
                <b-col cols="3">
                    <b-button variant="success" :disabled="sendToStudents" @click="sendQuestion">Send to students</b-button>
                </b-col>
            </b-row>
        </div>

        <div class="scoreboard" v-if="scoreBoard">
            <b-row>
                <b-col cols="3">
                    <div class="card">
                        <div class="card_note">Total answers</div>
                        <div class="card_subnote">{{correctStudents.length + inCorrectStudents.length}}</div>
                    </div>
                </b-col>
                <b-col cols="3">
                    <div class="card">
                        <div class="card_note">Total correct</div>
                        <div class="card_subnote">{{correctStudents.length}}</div>
                    </div>
                </b-col>
                <b-col cols="3">
                    <div class="card">
                        <div class="card_note">% correct</div>
                        <div class="card_subnote">{{correctStudents.length !== 0 ? correctStudents.length / (correctStudents.length + inCorrectStudents.length) * 100 : 0}}</div>
                    </div>
                </b-col>
                <b-col cols="3">
                    <div class="card">
                        <div class="card_note">Time remaining</div>
                        <div class="card_subnote">{{time}}</div>
                    </div>
                </b-col>
            </b-row>

            <b-row class="score-list">
                <b-col cols="6" class="correct">
                    <h2 class="sub-title mb-3">Correct</h2>
                    <div>
                        <div v-for="student in correctStudents" :key="student._id">{{student.name}}<span class="score">{{student.score}}</span></div>
                    </div>
                </b-col>
                <b-col cols="6" class="incorrect">
                    <h2 class="sub-title mb-3">Incorrect</h2>
                    <div>
                        <div v-for="student in inCorrectStudents" :key="student._id">{{student.name}}<span class="score">{{student.score}}</span></div>
                    </div>
                </b-col>
            </b-row>

            <b-row class="another-question">
                <b-button variant="success" @click="askAnotherQ" :disabled="time === 0 ? false : true">Ask another question</b-button>
            </b-row>
        </div>
    </div>
</template>

<script>
import QuestionService from '@/services/QuestionService'
import StudentService from '@/services/StudentService'
import io from 'socket.io-client'
export default {
  name: 'Teacher',
  data () {
    return {
      socket: null,
      sendToStudents: true,
      qTypeSelected: null,
      options: [
        { value: null, text: 'Select question type' },
        { value: 'multi', text: 'Multiple Choice' },
        { value: 'match', text: 'Matching Pairs' }
      ],
      score: '',
      time: '30',
      timerSelected: false,
      qContent: '',
      answers: [
        {
          id: Math.floor(Math.random() * Math.floor(100)),
          content: '',
          isCorrect: false
        }
      ],
      matches: [
        {
          id: Math.floor(Math.random() * Math.floor(100)),
          left: '',
          right: ''
        }
      ],
      scoreBoard: false,
      correctStudents: [],
      inCorrectStudents: []
    }
  },
  methods: {
    init: async function () {
      let self = this
      this.socket = io('http://localhost:4000')
      this.socket.on('showAnswers', async param => {
        let tmp = await StudentService.getStudent({id: param.id})
        if (param.isCorrect) {
          self.correctStudents.push(tmp.data.student)
        } else {
          self.inCorrectStudents.push(tmp.data.student)
        }
      })
    },
    getQType: function () {
      this.sendToStudents = false
    },
    add_answer: function () {
      this.answers.push({
        id: Math.floor(Math.random() * Math.floor(100)),
        content: '',
        isCorrect: false
      })
    },
    sendQuestion: async function () {
      var q = await QuestionService.addQuestion({
        qType: this.qTypeSelected,
        score: this.score,
        time: this.time,
        qContent: this.qContent,
        qAnswer: this.qTypeSelected === 'multi' ? this.answers : this.matches
      })
      this.socket.emit('addQuestion', q.data._id)
      this.$swal(
        'Great!',
        `Your question has been posted!`,
        'success'
      )
      this.scoreBoard = true
      let self = this
      let x = setInterval(function () {
        if (self.time <= 0) {
          clearInterval(x)
        } else {
          self.time -= 1
        }
      }, 1000)
    },
    add_match: function () {
      this.matches.push({
        id: Math.floor(Math.random() * Math.floor(100)),
        left: '',
        right: ''
      })
    },
    askAnotherQ: function () {
      this.scoreBoard = false
      this.qTypeSelected = null
      this.score = ''
      this.time = ''
      this.qContent = ''
      this.answers = [
        {
          id: Math.floor(Math.random() * Math.floor(100)),
          content: '',
          isCorrect: false
        }
      ]
      this.matches = [
        {
          id: Math.floor(Math.random() * Math.floor(100)),
          left: '',
          right: ''
        }
      ]
      this.correctStudents = []
      this.inCorrectStudents = []
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style type="text/css">
    .teacher-container {
        font-size: 25px;
    }

    .title {
      color: #222;
    }

    .sub-title {
      color: #999;
    }

    .add_answer {
      text-align: right;
    }

    .scoreboard {
        border: 1px solid #ddd;
        padding: 20px;
        border-radius: 5px;
    }

    .card {
        width: 50%;
        margin: 0 auto;
        text-align: center;
        padding: 10px;
        height: 140px;
        border-radius: 5px;
    }

    .card_subnote {
        font-weight: bold;
        font-size: 30px;
    }

    .score-list {
        margin-top: 60px;
        text-align: center;
    }

    .correct {
        border-right: 1px solid #ddd;
    }

    span.score {
        margin-left: 200px;
    }

    .another-question {
        margin-top: 50px;
    }

    .another-question button {
        margin: 0 auto;
    }
</style>