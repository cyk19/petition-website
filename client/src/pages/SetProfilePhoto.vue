<template>
  <div>
    <b-container class="container">
      <b-row>
        <b-col>
          <h3>Set Profile Photo (Optional)</h3>
          <hr>
        </b-col>
      </b-row>
      <b-form novalidate @submit.stop.prevent="onSubmit">

        <b-form-group id="input-group-6" label="Profile Picture" label-for="input-6" description="Valid image types are .jpg, .jpeg, .png and .gif">
          <b-form-file
            v-model="form.picture"
            placeholder="Choose a picture or drop it here..."
            drop-placeholder="Drop picture here..."
            accept="image/png, image/jpeg, image/gif"
            @change="onFileChange"
          ></b-form-file>
        </b-form-group>

        <div class="mt-3">Selected file: {{ form.picture ? form.picture.name : '' }}</div>
        <div v-if="pictureUrl" class="preview">
          <img :src="pictureUrl"/>
        </div>
        <div class="text-danger" :v-if="pictureErrorMsg != ''"> {{ pictureErrorMsg }}</div>

        <b-button type="submit" variant="primary">Set</b-button>
        <b-button @click="goToProfile" variant="primary">Continue</b-button>

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
          picture: null
        },
        pictureUrl: "",
        pictureErrorMsg: ""
      }
    },
    methods: {
      onFileChange(val) {
        const file = val.target.files[0];
        if (file) {
          this.pictureType = file['type'];
          const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
          if (!validImageTypes.includes(this.pictureType)) {
            this.pictureErrorMsg = "Invalid image type";
          } else {
            this.pictureErrorMsg = "";
            this.pictureUrl = URL.createObjectURL(file);
            this.form.picture = file;
          }
          return
        }
        this.pictureErrorMsg = "";
      },
      onSubmit: function () {
        let currentObj = this;
        axios.put(this.server + "users/" + this.$route.params.id + "/photo", currentObj.form.picture, {
          headers: {
            'X-Authorization': this.$cookie.get('token'),
            'Content-Type': currentObj.form.picture.type
          }
        })
          .then(() => {
            currentObj.$router.push("/profile/" + currentObj.$route.params.id);
          })
          .catch((err) => {
            currentObj.pictureErrorMsg = err.response.statusText;
          })
      },
      goToProfile() {
        this.$router.push("/profile/" + this.$route.params.id);
      }
    }
  }
</script>

<style>
  .container {
    padding-top: 10px;
  }

  .preview {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .preview img {
    max-width: 100%;
    max-height: 500px;
  }
</style>
