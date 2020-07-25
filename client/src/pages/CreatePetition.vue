<template>
  <div v-if="isLoggedIn">
    <b-container class="container">
      <b-row>
        <b-col>
          <h3>Create a petition</h3>
          <hr>
        </b-col>
      </b-row>
      <b-form novalidate @submit.stop.prevent="onSubmit">

        <b-form-group id="input-group-2" label="Title:" label-for="input-2">
          <b-form-input
            id="input-2"
            v-model="$v.form.title.$model"
            trim
            :state="validateFormState('title')"
            placeholder="Enter title"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="input-group-1"
          label="Description:"
          label-for="input-1"
        >
          <b-form-input
            id="input-1"
            v-model="$v.form.description.$model"
            type="email"
            :state = "validateFormState('description')"
            placeholder="Enter description"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="category-group" label="Category: " label-for="category">
          <b-form-select
            id="category"
            name="category"
            v-model="$v.form.selectedCategory.$model"
            :state="validateFormState('selectedCategory')"
            @change="getCategoryId"
            :options="categories"
            required
            aria-describedby="category-feedback"
          ></b-form-select>
          <b-form-invalid-feedback id="category-feedback">Please select an activity type.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group id="input-group-7" label="Closing Date" label-for="closingDate">
          <b-form-input
            id="closingDate"
            type="date"
            :state="validateFormState('closingDate')"
            v-model="$v.form.closingDate.$model"
            aria-describedby="closing-date-feedback"
          ></b-form-input>
          <b-form-invalid-feedback id="closing-date-feedback">Closing date must be in the future
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group id="input-group-8" label="Closing Time" label-for="closingTime">
          <b-form-input
            id="closingTime"
            type="time"
            :state="validateFormState('closingTime')"
            v-model="$v.form.closingTime.$model"
            aria-describedby="closing-time-feedback"
          ></b-form-input>
          <b-form-invalid-feedback id="closing-time-feedback">Closing time must be in the future.</b-form-invalid-feedback>
        </b-form-group>

        <b-form-group id="input-group-6" label="Petition Picture" label-for="input-6" description="Valid image types are .jpg, .jpeg, .png and .gif">
          <b-form-file
            v-model="$v.form.picture.$model"
            placeholder="Choose a picture or drop it here..."
            drop-placeholder="Drop picture here..."
            accept="image/png, image/jpeg, image/gif"
            @change="onFileChange"
            required
            :state="validateFormState('picture')"
          ></b-form-file>
        </b-form-group>

        <div class="mt-3">Selected file: {{ form.picture ? form.picture.name : '' }}</div>
        <div v-if="pictureUrl" class="preview">
          <img :src="pictureUrl"/>
        </div>
        <div class="text-danger" :v-if="pictureErrorMsg != ''"> {{ pictureErrorMsg }}</div>

        <div class="text-danger" v-if="creationErrorMsg !=''"> {{ creationErrorMsg }}</div>

        <b-button type="submit" variant="primary">Submit</b-button>

      </b-form>
    </b-container>
  </div>
</template>

<script>
  import {required} from 'vuelidate/lib/validators'
  import axios from 'axios'
  import {validationMixin} from "vuelidate";


  export default {
    mixins: {validationMixin},
    data() {
      return {
        server: "http://localhost:4941/api/v1/",
        form: {
          title: "",
          description: "",
          categoryId: null,
          closingDate: null,
          selectedCategory: "",
          picture: null,
          closingTime: ""
        },
        selectedCategoryId: null,
        categories: [],
        categoriesIdList: null,
        pictureUrl: null,
        creationErrorMsg: "",
        pictureErrorMsg: "",
        isLoggedIn: false
      }
    },
    validations: {
      form: {
        title: {
          required
        },
        description: {
          required
        },
        closingDate: {
          closingDateValidation(val) {
            if (!val) {
              return true;
            }
            let currentDate = new Date();
            currentDate.setHours(0,0);
            let closingDate = new Date(val);
            if (closingDate < currentDate) {
              return false
            }
            return true
          }
        },
        selectedCategory: {
          categoryValidation() {
            if (this.form.selectedCategory != "") {
              return true;
            }
            return false;
          },
          required
        },
        picture: {
          pictureValidation(val) {
            if (val) {
              return true;
            }
            return false;
          },
          required
        },
        closingTime: {
          closingTime(val) {
            if (this.form.closingDate) {
              let currentDate = new Date();
              let closingDate = new Date(this.form.closingDate);
              if (val && (currentDate === closingDate)) {
                let splitStartTime = val.split(":");
                let closingTimeObj = new Date();
                closingTimeObj.setHours(splitStartTime[0], splitStartTime[1]);
                let currentTimeObj = new Date();
                if (currentTimeObj >= closingTimeObj) {
                  return false;
                }
              }
            }
            return true;
          }
        }
      }
    },
    methods: {
      validateFormState: function(name) {
        const { $dirty, $error } = this.$v.form[name];
        return $dirty ? !$error : null;
      },
      convertToIsoString() {
        if (this.form.closingDate && this.form.closingTime) {
          let closingDateObject = new Date(this.form.closingDate + " " + this.form.closingTime);
          let offset = - (closingDateObject.getTimezoneOffset() / 60);
          closingDateObject.setHours(closingDateObject.getHours() + (offset*2));
          let closingDateISO = closingDateObject.toISOString();
          return closingDateISO.substring(0,10) + " " + closingDateISO.substring(11, 16);
        }
        return ""
      },
      onSubmit: function() {
        this.$v.form.$touch();
        if (this.$v.form.$anyError) {
          return
        }
        if (this.pictureErrorMsg != "") {
          return
        }
        if (!this.form.closingTime) {
          this.form.closingTime = "12:00"
        }
        let jsonData = {
          title: this.form.title,
          description: this.form.description,
          categoryId: this.form.categoryId,
          closingDate: this.convertToIsoString()
        };
        if (!this.form.closingDate) {
          delete jsonData.closingDate;
        }
        let currentObj = this;
        axios.post(this.server + "petitions", jsonData, {
          headers: {
            'X-Authorization': this.$cookie.get('token')
          }
        })
          .then((res) => {
            let petitionId = res.data.petitionId;
            currentObj.signPetition(petitionId);
            console.log(currentObj.form.picture);
            if (currentObj.form.picture) {
              currentObj.uploadPetitionPhoto(petitionId);
            }
            currentObj.$router.push("/petition/" + petitionId);
          })
          .catch((err) => {
            console.log(err);
            currentObj.creationErrorMsg = err.response.statusText;
          })
      },
      uploadPetitionPhoto(id) {
        let currentObj = this;
        axios.put(this.server + "petitions/" + id + "/photo", currentObj.form.picture, {
          headers: {
            'X-Authorization': this.$cookie.get('token'),
            'Content-Type': currentObj.form.picture.type
          }
        })
          .catch((err) => {
            currentObj.pictureErrorMsg = err.response.statusText;
          })
      },
      signPetition(id) {
        let currentObj = this;
        axios.post(this.server + "petitions/" + id + "/signatures", {}, {
          headers: {
            'X-Authorization': this.$cookie.get('token')
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        })
      },
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
        this.form.picture = null;
        this.pictureErrorMsg = "";
      },
      checkLoggedIn() {
        if (this.$cookie.get('id')) {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      },
      getPetitionCategories() {
        let currentObj = this;
        axios.get(this.server + "petitions/categories")
        .then((res) => {
          currentObj.categoriesIdList= res.data;
          for (let i=0; i<res.data.length; i++) {
            currentObj.categories.push(res.data[i].name)
          }
        })
      },
      getCategoryId() {
        for (let i=0; i<this.categoriesIdList.length; i++) {
          if (this.form.selectedCategory === this.categoriesIdList[i].name) {
            this.form.categoryId = parseInt(this.categoriesIdList[i].categoryId);
            return;
          }
        }
      }
    },
    mounted() {
      this.checkLoggedIn();
      this.getPetitionCategories();
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

