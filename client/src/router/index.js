import Vue from 'vue'
import Router from 'vue-router'
// edit
import Teacher from '@/components/Teacher'
import Student from '@/components/Student'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/teacher',
      name: 'Teacher',
      component: Teacher
    },
    {
      path: '/student',
      name: 'Student',
      component: Student
    }
  ]
})
