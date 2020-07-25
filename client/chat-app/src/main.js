import Vue from 'vue'
import App from './App.vue'
import Search from "./pages/Search.vue"
import Register from "./pages/Register.vue"
import Login from "./pages/Login.vue"
import Profile from "./pages/Profile.vue"
import PetitionTab from "./pages/PetitionTab.vue"
import CreatePetition from "./pages/CreatePetition.vue"
import SetProfilePhoto from "./pages/SetProfilePhoto.vue"
import Petition from "./pages/Petition.vue"



import axios from 'axios'
import VueAxios from 'vue-axios'
import VueRouter from 'vue-router'
import VueCookie from 'vue-cookie'
import {BootstrapVue, IconsPlugin, NavbarPlugin, BootstrapVueIcons } from 'bootstrap-vue'
import Vuelidate from 'vuelidate'
import VueSocialSharing from 'vue-social-sharing'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { dom } from '@fortawesome/fontawesome-svg-core'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

library.add(faTwitter);
library.add(faWhatsapp);
library.add(faEnvelope);
dom.watch();

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(VueRouter);
Vue.use(VueAxios, axios);
Vue.use(Vuelidate);
Vue.use(VueCookie);
Vue.use(VueSocialSharing);
// Install BootstrapVue
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);
Vue.use(NavbarPlugin);

const routes = [
  {
    path: "/",
    component: Search
  },
  {
    path: "/petition/:petitionId",
    component: Petition,
    name: "Petition"
  },
  {
    path: "/register",
    component: Register
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: "/profile/:id",
    component: Profile
  },
  {
    path: "/profile/:id/petitions",
    component: PetitionTab
  },
  {
    path: "/petitions/create",
    component: CreatePetition
  },
  {
    path:"/register/:id/setphoto",
    component: SetProfilePhoto
  }
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});
