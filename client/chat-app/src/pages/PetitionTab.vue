<template>
  <div v-if="isUser">
    <b-container class="container">
      <b-card no-body>
        <b-card-header header-tag="nav">
          <b-nav card-header tabs>
            <b-nav-item @click="goToProfile">Profile</b-nav-item>
            <b-nav-item active>Petition</b-nav-item>
          </b-nav>
        </b-card-header>

        <b-button variant="primary" to="/petitions/create">Create</b-button>

        <b-card-group v-for="(petition, index) in petitions" :key="index">
          <b-card style="max-width:1500px;">
            <b-row no-gutters>
              <b-col md="6">
                <b-card-title>
                  {{petition.title}}
                </b-card-title>
                <b-card-text>
                  <p>
                    Category: {{petition.category}} <br/>
                    Author: {{petition.authorName}} <br/>
                    Number of Signatures: {{petition.signatureCount}} <br/>
                  </p>
                </b-card-text>
                <router-link :to="{name: 'Petition', params: { petitionId: petition.petitionId}}">View</router-link>
              </b-col>
              <b-col md="6">
                <b-card-img v-if="petition.photo" :src="petition.photo" alt="Image" class="rounded-0"></b-card-img>
              </b-col>
            </b-row>
          </b-card>
        </b-card-group>
      </b-card>


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
        isUser: false,
        profileId: null,
        petitions: null,
      }
    },
    methods: {
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
      goToProfile() {
        this.$router.push('/profile/' + this.profileId)
      },
      getPetitions() {
        let currentObj = this;
        axios.get(this.server + "petitions")
        .then((res) => {
          currentObj.petitions = [];
          for (let i=0; i<res.data.length; i++) {
            currentObj.getAPetition(res.data[i].petitionId);
          }
        })
        .catch((err) => {
          console.log(err);
        })
      },
      getPetitionImage(id , index) {
        let currentObj = this;
        axios.get(this.server +  "petitions/" + id + "/photo")
          .then((res) => {
            currentObj.petitions[index].photo = this.server +  "petitions/" + id + "/photo"
          })
          .catch((err) => {
            currentObj.petitions[index].photo = null;
          });
      },
      getAPetition(id) {
        let currentObj = this;
        axios.get(this.server + "petitions/" + id)
        .then((res) => {
          if (currentObj.$cookie.get('id') == res.data.authorId) {
            let petition = {
              petitionId: res.data.petitionId,
              title: res.data.title,
              category: res.data.category,
              authorName: res.data.authorName,
              signatureCount: res.data.signatureCount,
              authorId: res.data.authorId,
              photo: null
            };
            currentObj.petitions.push(petition);
            currentObj.getPetitionImage(petition.petitionId, currentObj.petitions.length-1)
          }
        })
        .catch((err) => {
          console.log(err);
        })
      }
    },
    mounted() {
      this.checkIsUser();
      this.getPetitions();
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
