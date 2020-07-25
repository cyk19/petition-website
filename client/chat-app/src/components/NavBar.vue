<template>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand href="#">Motion.org</b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav>
        <b-nav-form>
          <b-button class="my-2 my-sm-0" @click="goToSearch">Search</b-button>
        </b-nav-form>

<!--        <b-nav-item-dropdown right>-->
<!--          &lt;!&ndash; Using 'button-content' slot &ndash;&gt;-->
<!--          <template v-slot:button-content>-->
<!--            <em>User</em>-->
<!--          </template>-->
<!--          <b-dropdown-item href="#">Profile</b-dropdown-item>-->
<!--          <b-dropdown-item href="#">Sign Out</b-dropdown-item>-->
<!--        </b-nav-item-dropdown>-->
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto" v-if="!isLoggedIn">
        <b-navbar-nav>
          <b-nav-item href="/register">Register</b-nav-item>
          <b-button href="/login"  class="my-2 my-sm-0">Log in</b-button>
        </b-navbar-nav>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto" v-if="isLoggedIn">
        <b-nav-item @click="goToProfile">Profile</b-nav-item>
        <b-nav-item @click="logOut">Log out</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
  import axios from 'axios'

  const NavBar = {
    name: "NavBar",
    data() {
      return {
        server: "http://localhost:4941/api/v1/",
        isLoggedIn: false,
        title: ""
      }
    },
    methods: {
      checkLoggedIn() {
        if (this.$cookie.get('token').length !== 0) {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      },
      goToProfile() {
        let profileId = this.$cookie.get('id');
        this.$router.push('/profile/' + profileId);
      },
      logOut() {
        let currentObj = this;
        axios.post(this.server + "users/logout", {},{
          headers: { 'X-Authorization': this.$cookie.get('token') }
        })
        .then ((res) => {
          currentObj.$cookie.set("token", "");
          currentObj.$cookie.set("id", "");
          currentObj.isLoggedIn = false;
          currentObj.$router.push('/');
        })
        .catch((err) => {
          currentObj.$router.push('/');
        })
      },
      goToSearch() {
        if (this.title.length === 0) {
          this.$router.push("/");
        }
      }
    },
    watch: {
      $route (to, from) {
        this.checkLoggedIn();
      }
    },
    mounted() {
      this.checkLoggedIn();
    }
  };
  export default NavBar;

</script>

