<template>
  <div>
    <b-container class="container">
      <b-row>
        <b-col>
          <h3>Search:</h3>
          <hr>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form inline>
            <label class="sr-only">Title</label>
            <b-input
              v-model="query.q"
              class="mb-2 mr-sm-2 mb-sm-0"
              placeholder="Petition title"
            ></b-input>
            <label class="mr-sm-2">Category</label>
            <b-form-select
              class="mb-2 mr-sm-2 mb-sm-0"
              :options="categories"
              v-model="query.category"
            ></b-form-select>

            <label class="mr-sm-2">Sort By</label>
            <b-form-select
              class="mb-2 mr-sm-2 mb-sm-0"
              :options="['', 'ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'SIGNATURES_ASC', 'SIGNATURES_DESC' ]"
              v-model="query.sortBy"
            ></b-form-select>

            <b-button variant="primary" @click="getPetitions">Search</b-button>
          </b-form>
        </b-col>
      </b-row>


      <b-card-group v-for="(petition, index) in currentPagePetitions" :key="index" :per-page="perPage" :currentPage="currentPage">
        <b-card style="max-width:1000px;">
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
      <b-pagination
        v-model="currentPage"
        :total-rows="totalPetition"
        :per-page="perPage"
        aria-controls="my-table"
      ></b-pagination>
      <b-row v-if="errorFlag" style="color: red">
        {{ error }}
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        server: "http://localhost:4941/api/v1/",
        petitions: [],
        errorFlag: false,
        error: "",
        categories: [""],
        categoriesIdList: [],
        currentPage: 1,
        paginatedPetitions: {},
        pageIndex: null,
        perPage: 10,
        totalPetition: null,
        query: {
          q: null,
          category: null,
          sortBy: null
        }
      }
    },
    computed: {
      petitionQuery() {
        let query = new URLSearchParams();
        if (this.query.q) {
          query.append('q', this.query.q);
        }
        if (this.query.category && this.query.category !== "") {
          for (let i=0; i<this.categoriesIdList.length; i++) {
            if (this.categoriesIdList[i].name === this.query.category) {
              query.append('categoryId', this.categoriesIdList[i].categoryId)
            }
          }
        }
        if (this.query.sortBy && this.query.sortBy !== "") {
          query.append('sortBy', this.query.sortBy);
        }
        return query
      },
      currentPagePetitions() {
        this.pageIndex = 0;
        this.paginatedPetitions = {};
        for (let i=0; i<this.totalPetition; i=i+this.perPage) {
          this.paginatedPetitions[this.pageIndex] = this.petitions.slice(i, i+this.perPage);
          this.pageIndex++;
        }
        return this.paginatedPetitions[this.currentPage-1]
      }
    },
    methods: {
      getPetitions: function () {
        let currentObj = this;
        axios.get(this.server + "petitions", {
          params: this.petitionQuery
        })
        .then((res) => {
          currentObj.totalPetition = res.data.length;
          currentObj.petitions = [];
          for (let i=0; i<res.data.length; i++) {
            let petition = {
              petitionId: res.data[i].petitionId,
              title: res.data[i].title,
              category: res.data[i].category,
              authorName: res.data[i].authorName,
              signatureCount: res.data[i].signatureCount,
              photo: null
            };
            currentObj.petitions.push(petition);
          }
          currentObj.getPetitionImage();
        })
        .catch((err) => {
          console.log(err);
          currentObj.error = err;
          currentObj.errorFlag = true;
        });
      },
      getPetitionImage() {
        let currentObj = this;
        for (let i=0; i<this.petitions.length; i++) {
          axios.get(this.server +  "petitions/" + this.petitions[i].petitionId + "/photo")
          .then((res) => {
            currentObj.petitions[i].photo = this.server +  "petitions/" + this.petitions[i].petitionId + "/photo"
          })
          .catch((err) => {
            currentObj.petitions[i].photo = null;
          })
        }
      },
      getCategories() {
        let currentObj = this;
        axios.get(this.server + "petitions/categories")
          .then((res) => {
            currentObj.categoriesIdList= res.data;
            for (let i=0; i<res.data.length; i++) {
              currentObj.categories.push(res.data[i].name)
            }
          })
      }
    },
    mounted: function () {
      this.getPetitions();
      this.getCategories();
    },
  }
</script>

<style>
  .container {
    padding-top: 10px;
    padding-right: 100px;
    padding-left: 100px;
  }
</style>

