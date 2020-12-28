import Api from '@/services/Api'

export default {

  addQuestion (params) {
    return Api().post('add_question', params)
  },

  getQuestionById (params) {
    return Api().get('get_question_by_id/' + params.id)
  }
}
