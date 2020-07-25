<template>
  <div id="app">
    <NavBar></NavBar>
    <router-view></router-view>
<!--    <div class="fixed-bottom">-->
<!--      <h1 class="text-lg-right" id="brand">-->
<!--        Motion.org-->
<!--      </h1>-->
<!--    </div>-->
  </div>
</template>

<script>
  import NavBar from './components/NavBar.vue'
  export default {
    name: 'app',
    components: {NavBar}
  }
</script>

<style>
  #brand {
    color: lightslategrey;
  }
</style>
