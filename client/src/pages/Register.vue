<template>
  <div>
    <b-container class="container">
      <b-row>
        <b-col>
          <h3>Sign up!</h3>
          <hr>
        </b-col>
      </b-row>
      <b-form novalidate @submit.stop.prevent="onSubmit">

        <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
          <b-form-input
            id="input-2"
            v-model="$v.form.name.$model"
            trim
            :state="validateState('name')"
            placeholder="Enter name"
            aria-describedby="name-feedback"
          ></b-form-input>
          <b-form-invalid-feedback id="name-feedback">
            Invalid first name. Cannot contain characters other than alphabets
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group
          id="input-group-1"
          label="Email address:"
          label-for="input-1"
          description="We'll never share your email with anyone else."
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
          <b-form-text id="password-help-block">
            Password must not be empty
          </b-form-text>
        </b-form-group>

        <b-form-group id="input-group-4" label="City" label-for="input-4">
          <b-form-input
            id="input-4"
            v-model="form.city"
            placeholder="Enter city"
            :state="validateState('city')"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-5" label="Country" label-for="input-5">
          <b-form-input
            id="input-5"
            v-model="form.country"
            placeholder="Enter country"
            :state="validateState('country')"
          ></b-form-input>
        </b-form-group>

        <div class="text-danger" v-if="registrationErrorMsg!=''"> {{ registrationErrorMsg }}</div>

        <b-button type="submit" variant="primary">Continue</b-button>

      </b-form>
    </b-container>
  </div>
</template>

<script>
  import {email, helpers, required} from 'vuelidate/lib/validators'
  import axios from 'axios'

  const nameValidate = helpers.regex('nameValidate', /^[a-zA-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/);

  export default {
    data() {
      return {
        server: "http://localhost:4941/api/v1/",
        form: {
          name: "",
          email: "",
          password: "",
          city: null,
          country: null
        },
        registrationErrorMsg: ""
      }
    },
    validations: {
      form: {
        name: {
          required,
          nameValidate
        },
        email: {
          required,
          email
        },
        password: {
          required
        },
        city: {
          nameValidate
        },
        country: {
          nameValidate
        }
      }
    },
    methods: {
      validateState: function(name) {
        const { $dirty, $error } = this.$v.form[name];
        return $dirty ? !$error : null;
      },
      onSubmit: function() {
        this.$v.form.$touch();
        if (this.$v.form.$anyError) {
          return
        }
        let currentObj = this;
        let jsonData = this.form;
        if (!this.form.city) {
          delete jsonData.city;
        }
        if (!this.form.country) {
          delete jsonData.country;
        }
        axios.post(this.server + "users/register", jsonData)
        .then((res) => {
          let profileId = res.data.userId;
          this.$cookie.set('id', profileId);
          currentObj.logIn();
          currentObj.$router.push("register/" + profileId + "/setphoto");
        })
        .catch((err) => {
          currentObj.registrationErrorMsg = err.response.statusText;
        })
      },
      logIn() {
        let currentObj = this;
        currentObj.registrationErrorMsg = "";
        axios.post(this.server + "users/login", {
          email: currentObj.form.email,
          password: currentObj.form.password
        })
          .then((res) => {
            let authToken = res.data.token;
            this.$cookie.set('token', authToken);
          })
          .catch((err) => {
            console.log(err)
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

