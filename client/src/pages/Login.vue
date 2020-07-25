<template>
  <div>
    <b-container class="container">
      <b-row>
        <b-col>
          <h3>Log in</h3>
          <hr>
        </b-col>
      </b-row>
      <b-form novalidate @submit.stop.prevent="onSubmit">

        <b-form-group
          id="input-group-1"
          label="Email address:"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="$v.form.email.$model"
            type="email"
            :state = "validateState('email')"
            placeholder="Enter email"
            aria-describedby="email-feedback"
          ></b-form-input>
          <b-form-invalid-feedback id="email-feedback">
            Invalid email.
          </b-form-invalid-feedback>
        </b-form-group>


        <b-form-group id="input-group-3" label="Password:" label-for="input-3">
          <b-input
            type="password"
            id="text-password"
            aria-describedby="password-help-block"
            placeholder="Enter password"
            :state="validateState('password')"
            v-model="$v.form.password.$model">
          </b-input>
        </b-form-group>

        <div class='text-danger' :state="loginErrorMsg!=''"> {{ loginErrorMsg }}</div>


        <b-button type="submit" variant="primary">Log in</b-button>

      </b-form>
    </b-container>
  </div>
</template>

<script>
  import {email, required} from 'vuelidate/lib/validators'
  import axios from 'axios'

  export default {
    data() {
      return {
        server: "http://localhost:4941/api/v1/",
        form: {
          email: "",
          password: ""
        },
        loginErrorMsg: ""
      }
    },
    validations: {
      form: {
        email: {
          required,
          email
        },
        password: {
          required
        }

      }
    },
    methods: {
      validateState: function(name) {
        const { $dirty, $error } = this.$v.form[name];
        return $dirty ? !$error : null;
      },
      onSubmit: function () {
        let currentObj = this;
        this.$v.form.$touch();
        if (this.$v.form.$anyError) {
          return;
        }
        axios.post(this.server + "users/login", this.form)
        .then((res) => {
          currentObj.loginErrorMsg = "";
          let profileId = res.data.userId;
          let authToken = res.data.token;
          this.$cookie.set('token', authToken);
          this.$cookie.set('id', profileId);
          currentObj.$router.push("/profile/" + profileId)
        })
        .catch((err) => {
          currentObj.loginErrorMsg = err.response.statusText
        })
      }
    }
  }
</script>

<style>
  .container {
    padding-top: 10px;
  }
</style>
