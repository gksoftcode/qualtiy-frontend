<template>
  <div>
    <v-navigation-drawer width="25%" v-model="drawer" clipped app right>
      <v-card :loading="loadingTree" height="100%">
        <v-card-title>
          بلدية الحمرية
        </v-card-title>
        <v-card-text>
          <v-overlay v-model="loading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <div>
            <v-treeview
              open-all
              :active.sync="selectedDepartment"
              dense
              return-object
              :items="root"
              item-children="departmentList"
              item-key="id"
              activatable
              hoverable
            >
              <template v-slot:prepend="{ item }" v-if="false">
                <v-icon v-if="item.departmentList.length > 0">
                  mdi-view-grid
                </v-icon>

                <v-icon v-if="item.departmentList.length === 0">
                  mdi-cube-outline
                </v-icon>
              </template>
            </v-treeview>
          </div>
        </v-card-text>
      </v-card>
      <!--      <template  v-slot:append>-->
      <!--        <v-divider dense></v-divider>-->
      <!--        <v-btn-->
      <!--          :disabled="selectedDepartment.length === 0"-->
      <!--          icon-->
      <!--          @click="editWorkGuide"-->
      <!--        >-->
      <!--          <v-icon color="primary">mdi-square-edit-outline</v-icon>-->
      <!--        </v-btn>-->
      <!--        <v-btn-->
      <!--          :disabled="selectedDepartment.length === 0"-->
      <!--          icon-->
      <!--          @click="newVersionWorkGuide"-->
      <!--        >-->
      <!--          <v-icon color="primary">mdi-puzzle-star</v-icon>-->
      <!--        </v-btn>-->
      <!--      </template>-->
    </v-navigation-drawer>
    <v-app-bar clipped-right app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('../assets/swlogo.png')"
          transition="scale-transition"
          width="40"
        />
        <span
          class="shrink mt-1 hidden-sm-and-down"
          style="min-font-size: 100;width: 100;display: inline-block"
        >
          نظام الاجراءات الادارية
        </span>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      </div>

      <v-spacer></v-spacer>
      <v-btn to="/admin" text>
        إدارة النظام
        <v-icon class="mr-2">mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view> </router-view>
      <!--      <work-guide-->
      <!--        :department-id="departmentId"-->
      <!--        :department-name="departmentName"-->
      <!--        @updated="ViewUpdated"-->
      <!--      ></work-guide>-->
    </v-main>
  </div>
</template>

<script>
// @ is an alias to /src
import DepartmentService from '@/service/department/DepartmentService'
import WorkGuide from '@/components/WorkGuide'
import router from '@/router'
import Landing from '@/components/Landing'
import { mapState } from 'vuex'
export default {
  name: 'Home',
  components: { Landing, WorkGuide },
  mounted() {
    this.loadDepartmentTree()
  },
  computed: {
    ...mapState('wg', ['loading'])
  },
  watch: {
    selectedDepartment() {
      if (this.selectedDepartment.length > 0) {
        this.loadingObject = true
        this.departmentId = this.selectedDepartment[0].encId
        this.departmentName = this.selectedDepartment[0].name
        router.push('/view/' + this.departmentId)
      }
    }
  },
  methods: {
    ViewUpdated(wg) {
      this.loadingObject = false
    },
    editWorkGuide() {
      router.push('/admin/WorkGuideEditorDept/' + this.departmentId + '/1')
    },
    newVersionWorkGuide() {
      router.push('/admin/WorkGuideEditorDept/' + this.departmentId + '/5')
    },
    loadDepartmentTree() {
      this.loadingTree = true
      DepartmentService.loadTree()
        .then(response => {
          this.root = response.data
          this.loadingTree = false
        })
        .catch(error => {
          this.loadingTree = false
        })
    }
  },
  data() {
    return {
      loadingObject: false,
      drawer: true,
      root: [],
      selectedDepartment: [],
      loadingTree: false,
      departmentId: '0',
      departmentName: ''
    }
  }
}
</script>

<style type="scss">
.definitionTitle {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--v-primary-base);
}
.procedure-title {
  font-weight: bold;
  color: var(--v-accent-base);
}
.header-procedure-responsibility {
  writing-mode: tb-rl;
}
</style>
