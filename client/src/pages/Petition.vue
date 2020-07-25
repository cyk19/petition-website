<template>
  <div v-if="this.$route.params.petitionId">
    <b-card-group deck>
      <b-card header="Petition">
        <div class="preview">
          <b-img :src="petition.petitionUrl"></b-img>
        </div>
        <b-card-body class="text-center">
          <b-card-title>{{ petition.title }}</b-card-title>
          <b-card-text>
            Description: {{ petition.description }} <br />
            Number of Signatures: {{ petition.numSignatures }} <br/>
            Category: {{ petition.category }} <br/>
            Created Date: {{ petition.createdDate }} <br/>
            Closing Date: {{ petition.closingDate ? petition.closingDate: 'There is no closing date' }} <br/>
          </b-card-text>
          <b-button v-if="!buttonDisabledFlag" variant="outline-primary" @click="signPetition">{{ buttonText }}</b-button>
          <b-button v-if="buttonDisabledFlag" variant="outline-primary" disabled>{{ buttonText }}</b-button>
          <b-button v-if="canBeEdited" variant="success" v-b-modal.modal-prevent-closing="'edit-petition'" @click="convertToDateTime">Edit</b-button>
          <b-button v-if="canBeDeleted" variant="danger" v-b-modal.modal-prevent-closing="'delete-petition'" >Delete</b-button>

          <b-container class="bv-example-row">
          </b-container>
          <b-row class="justify-content-md-center">
            <ShareNetwork
            network="twitter"
            :url="this.$route.toString()"
            :title="petition.title"
            :description="petition.description"
            :quote="petition.description"
            :hashtags="petition.category"
          >
            <i class="fab fah fa-lg fa-twitter"></i>
            <b-button >Share on Twitter</b-button>
          </ShareNetwork>
          </b-row>

          <b-row class="justify-content-md-center">
            <ShareNetwork
              network="whatsapp"
              :url="this.$route.toString()"
              :title="petition.title"
              :description="petition.description"
              :quote="petition.description"
              :hashtags="petition.category"
            >
              <i class="fab fah fa-lg fa-whatsapp"></i>
              <b-button >Share on Whatsapp</b-button>
            </ShareNetwork>
          </b-row>

          <b-row class="justify-content-md-center">
          <ShareNetwork
            network="email"
            :url="this.$route.toString()"
            :title="petition.title"
            :description="petition.description"
          >
            <i class="fas fah fa-lg fa-envelope"></i>
            <b-button >Share on Email</b-button>
          </ShareNetwork>
          </b-row>


          <b-modal
            id="delete-petition"
            @ok="handleDelete"
          >Delete petition {{ petition.title }} ?</b-modal>


          <b-modal
            id="edit-petition"
            title="Edit Petition"
            @ok="handleOk"
            @cancel="getPetition"
          >
            <form @submit.stop.prevent="editPetition">
              <b-form-group id="input-group-2" label="Title:" label-for="input-2">
                <b-form-input
                  id="input-2"
                  v-model="$v.petition.title.$model"
                  trim
                  :state="validateState('title')"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                id="input-group-1"
                label="Description:"
                label-for="input-1"
              >
                <b-form-input
                  id="input-1"
                  v-model="$v.petition.description.$model"
                  type="email"
                  :state = "validateState('description')"
                ></b-form-input>
              </b-form-group>

              <b-form-group id="category-group" label="Category: " label-for="category">
                <b-form-select
                  id="category"
                  name="category"
                  v-model="$v.petition.category.$model"
                  :state="validateState('category')"
                  @change="getCategoryId"
                  :options="categories"
                  aria-describedby="category-feedback"
                ></b-form-select>
              </b-form-group>

              <b-form-group id="input-group-7" label="Closing Date" label-for="closingDate">
                <b-form-input
                  id="closingDate"
                  type="date"
                  :state="validateDurationFormState('closingDate')"
                  v-model="$v.durationForm.closingDate.$model"
                  aria-describedby="closing-date-feedback"
                ></b-form-input>
                <b-form-invalid-feedback id="closing-date-feedback">Closing date must be in the future
                </b-form-invalid-feedback>
              </b-form-group>

              <b-form-group id="input-group-8" label="Closing Time" label-for="closingTime">
                <b-form-input
                  id="closingTime"
                  type="time"
                  :state="validateDurationFormState('closingTime')"
                  v-model="$v.durationForm.closingTime.$model"
                  aria-describedby="closing-time-feedback"
                ></b-form-input>
                <b-form-invalid-feedback id="closing-time-feedback">Closing time must be in the future.</b-form-invalid-feedback>
              </b-form-group>

              <b-form-group id="input-group-6" label="Petition Picture" label-for="input-6" description="Valid image types are .jpg, .jpeg, .png and .gif">
                <b-form-file
                  v-model="$v.petition.picture.$model"
                  placeholder="Choose a picture or drop it here..."
                  drop-placeholder="Drop picture here..."
                  accept="image/png, image/jpeg, image/gif"
                  @change="onFileChange"
                  required
                  :state="validateState('picture')"
                ></b-form-file>
              </b-form-group>

              <div class="mt-3">Selected file: {{ petition.picture ? petition.picture.name : '' }}</div>
              <div v-if="petition.petitionUrl" class="preview">
                <img :src="petition.petitionUrl"/>
              </div>
              <div class="text-danger" :v-if="pictureErrorMsg != ''"> {{ pictureErrorMsg }}</div>

              <div class="text-danger" v-if="editErrorMsg !=''"> {{ editErrorMsg }}</div>
            </form>
          </b-modal>
        </b-card-body>
      </b-card>

      <b-card header="Author">
        <div class="preview">
          <b-img :src="author.profileUrl"></b-img>
        </div>
        <b-card-body class="text-center">
          <b-card-title>{{ author.name }}</b-card-title>
          <b-card-text>
            City: {{ author.city ? author.city: "" }} <br />
            Country: {{ author.country ? author.country: "" }}
          </b-card-text>
        </b-card-body>
      </b-card>
    </b-card-group>

    <b-card-group deck>

    </b-card-group>

    <b-row v-if="errorFlag" style="color: red" align-content="center">
      {{ error }}
    </b-row>

    <b-container>
      <b-row>
        <b-col>
          <h4>List of Signatories</h4>
          <hr>
        </b-col>
      </b-row>
      <b-card-group v-for="(signature, index) in signatories" :key="index" deck>
        <b-card style="max-width:1000px;" header="Signatory" align="center">
          <b-row no-gutters>
            <b-col md="6">
              <b-card-title>
                {{signature.name}}
              </b-card-title>
              <b-card-text>
                <p>
                  City: {{signature.city ? signature.city : ""}} <br/>
                  Country: {{signature.country ? signature.country: ""}} <br/>
                  Signed date: {{signature.signedDate}} <br/>
                </p>
              </b-card-text>
            </b-col>
            <b-col md="6" class="preview">
              <b-card-img v-if="signature.photo" :src="signature.photo" alt="Image" class="rounded-0"></b-card-img>
            </b-col>
          </b-row>
        </b-card>
      </b-card-group>
    </b-container>

  </div>
</template>

<script>
  import axios from 'axios'
  import {required} from 'vuelidate/lib/validators'
  import {validationMixin} from "vuelidate";



  export default {

    data() {
      return {
        server: "http://localhost:4941/api/v1/",
        petition: {
          title: "",
          description: "",
          numSignatures: "",
          category: "",
          createdDate: null,
          closingDate: null,
          petitionUrl: null,
          categoryId: null,
          picture: null
        },
        author: {
          name: "",
          city: null,
          country: null,
          profileUrl: "",
          authorId: null
        },
        durationForm: {
          closingDate: null,
          closingTime: null
        },
        signatories: [],
        error: "",
        errorFlag: false,
        pictureErrorMsg: "",
        editErrorMsg: "",
        categories: [],
        categoriesIdList: [],
        buttonText: "Sign this petition",
        buttonDisabledFlag: false,
        defaultImage: "data:image/jpeg;base64,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"
      }
    },
    validations: {
      petition: {
        title: {
          required
        },
        description: {
          required
        },
        category: {
          required
        },
        picture: {
          validatePicture() {
            if (this.petition.petitionUrl) {
              return true;
            }
            return false;
          }
        }
      },
      durationForm: {
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
        closingTime: {
          closingTime(val) {
            if (this.durationForm.closingDate) {
              let currentDate = new Date();
              let closingDate = new Date(this.durationForm.closingDate);
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
    computed: {
      canBeEdited() {
        if (this.$cookie.get('id') == this.author.authorId) {
          if (this.petition.closingDate) {
            let currentDate = new Date();
            let closingDate =  new Date(this.petition.closingDate);
            if (currentDate <= closingDate) {
              return true;
            }
          } else {
            return true;
          }
        }
        return false;
      },
      canBeDeleted() {
        if (this.$cookie.get('id') == this.author.authorId) {
          this.buttonDisabledFlag = true;
          return true;
        }
        return false;
      }
    },
    methods: {
      validateState: function(name) {
        const { $dirty, $error } = this.$v.petition[name];
        return $dirty ? !$error : null;
      },
      validateDurationFormState: function(name) {
        const { $dirty, $error } = this.$v.durationForm[name];
        return $dirty ? !$error : null;
      },
      getPetition() {
        let currentObj = this;
        axios.get(this.server + "petitions/" + this.$route.params.petitionId)
        .then((res) => {
          currentObj.petition.title = res.data.title;
          currentObj.petition.description = res.data.description;
          currentObj.petition.category = res.data.category;
          currentObj.petition.numSignatures = res.data.signatureCount;
          currentObj.petition.createdDate = res.data.createdDate;
          currentObj.petition.closingDate = res.data.closingDate;
          currentObj.author.name = res.data.authorName;
          currentObj.author.authorId = res.data.authorId;
          if (res.data.authorCity) {
            currentObj.author.city = res.data.authorCity;
          }
          if (res.data.authorCountry) {
            currentObj.author.country = res.data.authorCountry;
          }
          currentObj.getAuthorPhoto(res.data.authorId);
          currentObj.getSignatories();
          currentObj.getPetitionPhoto();
        })
        .catch ((err) => {
          currentObj.errorFlag = true;
          currentObj.error = err;
        });
      },
      getAuthorPhoto(authorId) {
        let currentObj = this;
        axios.get(this.server + "users/" + authorId + "/photo")
        .then((res) => {
          currentObj.author.profileUrl = this.server + "users/" + authorId + "/photo";
        })
        .catch ((err) => {
          console.log(err);
          currentObj.author.profileUrl = currentObj.defaultImage;
        })
      },
      getPetitionPhoto() {
        let currentObj = this;
        axios.get(this.server + "petitions/" + this.$route.params.petitionId + "/photo")
        .then((res) => {
          currentObj.petition.petitionUrl = this.server + "petitions/" + this.$route.params.petitionId + "/photo";
        })
        .catch((err) => {
          currentObj.$router.go(0);
          currentObj.petition.petitionUrl = null
        })
      },
      getSignatories() {
        let currentObj = this;
        axios.get(this.server + "petitions/" + this.$route.params.petitionId + "/signatures")
        .then((res) => {
          currentObj.signatories = [];
          for (let i=0; i<res.data.length; i++) {
            let signature = {
              signatoryId: res.data[i].signatoryId,
              name: res.data[i].name,
              city: res.data[i].city,
              country: res.data[i].country,
              signedDate: res.data[i].signedDate,
              photo: null
            };
            if (signature.signatoryId == this.$cookie.get('id')) {
              currentObj.buttonText = "Signed";
            }
            currentObj.signatories.push(signature);
          }
          if (currentObj.petition.closingDate) {
            let closingDate = new Date(currentObj.petition.closingDate);
            let currentDate = new Date();
            if (currentDate > closingDate) {
              currentObj.buttonText = "Petition is closed";
              currentObj.buttonDisabledFlag = true;
            }
          }
          currentObj.getSignatoryPhoto();
        })
        .catch((err) => {
          console.log(err)
        })
      },
      getSignatoryPhoto() {
        let currentObj = this;
        for (let i=0; i<this.signatories.length; i++) {
          axios.get(this.server +  "users/" + this.signatories[i].signatoryId + "/photo")
            .then((res) => {
              currentObj.signatories[i].photo = this.server +  "users/" + this.signatories[i].signatoryId + "/photo"
            })
            .catch((err) => {
              currentObj.signatories[i].photo = currentObj.defaultImage;
            })
        }
      },
      signPetition() {
        let currentObj = this;
        if (this.buttonText !== "Signed") {
          axios.post(this.server + "petitions/" + this.$route.params.petitionId + "/signatures", {}, {
            headers: {
              'X-Authorization': this.$cookie.get('token')
            }
          })
            .then((res) => {
              currentObj.buttonText = "Signed";
              currentObj.getSignatories();
            })
            .catch((err) => {
              console.log(err);
              throw err;
            })
        } else {
          if (!this.canBeDeleted) {
            axios.delete(this.server + "petitions/" + this.$route.params.petitionId + "/signatures", {
              headers: {
                'X-Authorization': this.$cookie.get('token')
              }
            })
              .then((res) => {
                currentObj.buttonText = "Sign this petition";
                currentObj.getSignatories();
              })
              .catch((err) => {
                console.log(err);
              })
          }
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
          if (this.petition.category === this.categoriesIdList[i].name) {
            this.petition.categoryId = parseInt(this.categoriesIdList[i].categoryId);
            return;
          }
        }
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
            this.petition.petitionUrl = URL.createObjectURL(file);
            this.petition.picture = file;
          }
          return
        }
        this.petition.picture = null;
        this.pictureErrorMsg = "";
      },
      convertToIsoString() {
        if (this.durationForm.closingDate && this.durationForm.closingTime) {
          let closingDateObject = new Date(this.durationForm.closingDate + " " + this.durationForm.closingTime);
          let offset = - (closingDateObject.getTimezoneOffset() / 60);
          closingDateObject.setHours(closingDateObject.getHours() + (offset*2));
          let closingDateISO = closingDateObject.toISOString();
          return closingDateISO.substring(0,10) + " " + closingDateISO.substring(11, 16);
        }
        return ""
      },
      editPetition() {
        this.$v.petition.$touch();
        this.$v.durationForm.$touch();
        if (this.$v.petition.$anyError || this.$v.durationForm.$anyError) {
          return
        }
        this.getCategoryId();
        if (!this.durationForm.closingTime) {
          this.durationForm.closingTime = "12:00"
        }
        let jsonData = {
          title: this.petition.title,
          description: this.petition.description,
          categoryId: this.petition.categoryId,
          closingDate: this.convertToIsoString()
        };
        // console.log(jsonData.closingDate);
        if (!this.durationForm.closingDate) {
          delete jsonData.closingDate;
        }
        let currentObj = this;
        axios.patch(this.server + "petitions/" + this.$route.params.petitionId, jsonData, {
          headers: {
            'X-Authorization': this.$cookie.get('token')
          }
        })
          .then((res) => {
            if (currentObj.petition.picture) {
              currentObj.uploadPetitionPhoto(this.$route.params.petitionId);
            }
            currentObj.$bvModal.hide('edit-petition');
            currentObj.getPetition();
          })
          .catch((err) => {
            console.log(err);
            currentObj.editErrorMsg = err.response.statusText;
          })
      },
      uploadPetitionPhoto(id) {
        let currentObj = this;
        axios.put(this.server + "petitions/" + id + "/photo", currentObj.petition.picture, {
          headers: {
            'X-Authorization': this.$cookie.get('token'),
            'Content-Type': currentObj.petition.picture.type
          }
        })
          .catch((err) => {
            currentObj.pictureErrorMsg = err.response.statusText;
          })
      },
      convertToDateTime() {
        // console.log(this.petition.closingDate);
        if (this.petition.closingDate) {
          this.durationForm.closingDate = this.petition.closingDate.substring(0, 10);
          this.durationForm.closingTime = this.petition.closingDate.substring(11, 16);
        }
      },
      handleOk(bvModalEvt) {
        bvModalEvt.preventDefault();
        this.editPetition();
      },
      handleDelete(bvModalEvt) {
        bvModalEvt.preventDefault();
        this.deletePetition();
      },
      deletePetition() {
        let currentObj = this;
        axios.delete(this.server + "petitions/" + this.$route.params.petitionId, {
          headers: {
            'X-Authorization': this.$cookie.get('token')
          }
        })
        .then((res) => {
          currentObj.$bvModal.hide('delete-petition');
          currentObj.$router.push('/');
        })
        .catch ((err) => {
          console.log(err);
        })
      }
    },
    mounted() {
      this.getPetition();
      this.getPetitionCategories();
    }

  }

</script>

<style>
  .container {
    padding-top: 10px;
    padding-left: 50px;
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

  .justify-content-md-center {
    padding-top: 10px;
  }
</style>
