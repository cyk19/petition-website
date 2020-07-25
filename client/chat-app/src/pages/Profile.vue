<template>
  <div v-if="isUser">
    <b-container class="container">
      <b-card no-body>
        <b-card-header header-tag="nav">
          <b-nav card-header tabs>
            <b-nav-item active>Profile</b-nav-item>
            <b-nav-item @click="goToUserPetitions">Petition</b-nav-item>
          </b-nav>
        </b-card-header>

        <div class="preview">
          <b-img :src="pictureUrl"></b-img>
        </div>

        <b-card-body class="text-center">
          <b-card-title>{{ name }}</b-card-title>

        <b-card-text>
          Email: {{ email }}
        </b-card-text>

        <b-card-text>
          City: {{ city }}
        </b-card-text>

        <b-card-text>
          Country: {{ country }}
        </b-card-text>

        <b-button variant="primary" v-b-modal.modal-prevent-closing="'edit-profile'">Edit</b-button>

        <b-modal
          id="edit-profile"
          title="Edit Profile"
          @ok="handleEdit"
          @cancel="getUserInfo"
        >
          <form @submit.stop.prevent="editProfile">

            <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
              <b-form-input
                id="input-2"
                v-model="$v.name.$model"
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
                v-model="$v.email.$model"
                type="email"
                :state = "validateState('email')"
                placeholder="Enter email"
                aria-describedby="email-feedback"
              ></b-form-input>
              <b-form-invalid-feedback id="email-feedback">
                Invalid email.
              </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id="input-group-6" label="Old Password:" label-for="input-6">
              <b-input
                type="password"
                id="old-password"
                aria-describedby="password-help-block"
                placeholder="Enter password"
                :state="validateState('oldpassword')"
                v-model="$v.oldpassword.$model">
              </b-input>
              <b-form-text id="password-help-block">
                Password must not be empty
              </b-form-text>
            </b-form-group>


            <b-form-group id="input-group-3" label="New Password:" label-for="input-3">
              <b-input
                type="password"
                id="new-password"
                aria-describedby="password-help-block"
                placeholder="Enter password"
                :state="validateState('newpassword')"
                v-model="$v.newpassword.$model">
              </b-input>
              <b-form-text id="password-help-block">
                Password must not be empty
              </b-form-text>
            </b-form-group>

            <b-form-group id="input-group-4" label="City" label-for="input-4">
              <b-form-input
                id="input-4"
                v-model="city"
                placeholder="Enter city"
                :state="validateState('city')"
              ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-5" label="Country" label-for="input-5">
              <b-form-input
                id="input-5"
                v-model="country"
                placeholder="Enter country"
                :state="validateState('country')"
              ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-7" label="Profile Picture" label-for="input-6" description="Valid image types are .jpg, .jpeg, .png and .gif">
              <b-form-file
                v-model="picture"
                placeholder="Choose a picture or drop it here..."
                drop-placeholder="Drop picture here..."
                accept="image/png, image/jpeg, image/gif"
                @change="onFileChange"
              ></b-form-file>
            </b-form-group>

            <b-button @click="removeProfilePicture"> Remove profile picture </b-button>

            <div class="mt-3">Selected file: {{ picture ? picture.name : '' }}</div>
            <div v-if="pictureUrl" class="preview">
              <img :src="pictureUrl"/>
            </div>
            <div class="text-danger" :v-if="pictureErrorMsg != ''"> {{ pictureErrorMsg }}</div>

            <div class="text-danger" v-if="editProfileErrorMsg!=''"> {{ editProfileErrorMsg }}</div>
          </form>
        </b-modal>
        </b-card-body>
      </b-card>
    </b-container>
  </div>
</template>

<script>
  import axios from 'axios'
  import {helpers, required} from 'vuelidate/lib/validators'
  const nameValidate = helpers.regex('nameValidate', /^[a-zA-Z]+(([' -][a-zA-Z ])?[a-zA-Z]*)*$/);

  export default {
    data() {
      return {
        server: "http://localhost:4941/api/v1/",
        isUser: false,
        profileId: null,
        name: "",
        email: "",
        city: "",
        country: "",
        oldpassword: null,
        newpassword: null,
        picture: null,
        editProfileErrorMsg: "",
        pictureErrorMsg: "",
        defaultPictureUrl: "data:image/jpeg;base64,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",
        pictureUrl: "data:image/jpeg;base64,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"
      }
    },
    validations: {
      name: {
        required,
        nameValidate
      },
      email: {
        required
      },
      city: {
        nameValidate
      },
      country: {
        nameValidate
      },
      oldpassword: {
        validatePassword(val) {
          if (val === "" && this.newpassword === "") {
            return true
          }
          if (val === "" || this.newpassword === "") {
            return false;
          }
          return true;
        }
      },
      newpassword: {
        validatePassword(val) {
          if (val === "" && this.oldpassword === "") {
            return true
          }
          if (val === "" || this.oldpassword === "") {
            return false;
          }
          return true;
        }
      },
      picture: {
        validatePicture() {
          if (this.pictureUrl) {
            return true;
          }
          return false;
        }
      }
    },
    methods: {
      validateState: function(name) {
        const { $dirty, $error } = this.$v[name];
        return $dirty ? !$error : null;
      },
      checkIsUser() {
        if (this.$cookie.get('id')) {
          if (this.$cookie.get('id') === this.$route.params.id) {
            this.isUser = true;
            this.profileId = this.$cookie.get('id');
            return;
          }
        }
        this.isUser = false
      },
      getUserInfo() {
        let currentObj = this;
        axios.get(this.server + "users/" + this.profileId, {
          'headers': { 'X-Authorization': this.$cookie.get('token') }
        })
        .then((res) => {
          currentObj.name = res.data.name;
          currentObj.city = res.data.city;
          currentObj.country = res.data.country;
          currentObj.email = res.data.email;
        })
        .catch((err) => {
          this.$router.push('/login')
        })
      },
      getProfilePicture() {
        let currentObj = this;
        axios.get(this.server + "users/" + this.profileId + "/photo")
        .then((res) => {
          currentObj.pictureUrl = this.server + "users/" + this.profileId + "/photo"
        })
        .catch((err) => {
          console.log(err);
          currentObj.pictureUrl =  "data:image/jpeg;base64,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"
        })
      },
      goToUserPetitions() {
        this.$router.push("/profile/" + this.profileId + "/petitions")
      },
      handleEdit(bvModalEvt) {
        bvModalEvt.preventDefault();
        this.editProfile();
      },
      editProfile() {
        let currentObj = this;
        this.$v.$touch();
        if (this.$v.$anyError) {
          return;
        }
        let jsonData = {
          name: this.name,
          email: this.email,
          password: this.newpassword,
          currentPassword: this.oldpassword,
          city: this.city,
          country: this.country
        };
        if ((this.newpassword === "" && this.oldpassword === "") || (this.newpassword == null && this.oldpassword == null)) {
          delete jsonData.password;
          delete jsonData.currentPassword;
        }
        axios.patch(this.server + "users/" + this.$route.params.id, jsonData, {
          'headers': { 'X-Authorization': this.$cookie.get('token') }
        })
        .then((res) => {
          if (currentObj.picture && (currentObj.pictureUrl != currentObj.defaultPictureUrl)) {
            currentObj.setProfilePicture();
          }
          currentObj.$bvModal.hide('edit-profile');
          this.oldpassword = "";
          this.newpassword = "";
          currentObj.getUserInfo();
          currentObj.getProfilePicture();
        })
        .catch((err) => {
          console.log(err);
          currentObj.editProfileErrorMsg = err.response.statusText
        })
      },
      setProfilePicture() {
        let currentObj = this;
        axios.put(this.server + "users/" + this.$route.params.id + "/photo", this.picture, {
          headers: {
            'X-Authorization': this.$cookie.get('token'),
            'Content-Type': this.picture.type
          }
        })
          .then(() => {
          })
          .catch((err) => {
            currentObj.pictureErrorMsg = err.response.statusText;
          })
      },
      onFileChange(val) {
        const file = val.target.files[0];
        if (file) {
          let pictureType = file['type'];
          const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
          if (!validImageTypes.includes(pictureType)) {
            this.pictureErrorMsg = "Invalid image type";
          } else {
            this.pictureErrorMsg = "";
            this.pictureUrl = URL.createObjectURL(file);
            this.picture = file;
          }
          return
        }
        this.picture = null;
        this.pictureErrorMsg = "";
      },
      removeProfilePicture() {
        let currentObj = this;
        axios.delete(this.server + "users/" + this.$route.params.id + "/photo", {
          'headers': { 'X-Authorization': this.$cookie.get('token') }
        })
        .then((res) => {
          currentObj.pictureUrl = currentObj.defaultPictureUrl;
          currentObj.picture = null;
        })
        .catch((err) => {
          currentObj.pictureErrorMsg = err.response.statusText;
        })
      }
    },
    mounted() {
      this.checkIsUser();
      this.getUserInfo();
      this.getProfilePicture();
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
    max-width: 50%;
    max-height: 250px;
  }
</style>
