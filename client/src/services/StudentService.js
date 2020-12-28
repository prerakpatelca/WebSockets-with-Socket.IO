import Api from '@/services/Api'

export default {
  addStudent (params) {
    return Api().post('add_student', params)
  },

  editStudent (params) {
    return Api().put('edit_student/' + params.id, params)
  },

  getStudent (params) {
    return Api().get('get_student/' + params.id)
  },

  getAllStudents () {
    return Api().get('get_all_students')
  }
}
