<template>
  <v-card>
    <v-card-title>
      WebSocket Page
    </v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="6">
          <v-text-field
            dense
            outlined
            label="الرسالة"
            v-model="message"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn color="primary" @click="sendMsg">
            ارسال
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions> </v-card-actions>
  </v-card>
</template>

<script>
import Error401 from '@/components/Error401'
import { mapState } from 'vuex'
import SockJS from 'sockjs-client'
import Stomp from 'webstomp-client'
import { Paths } from '@/Paths'
import authHeader from '@/util/auth-header'
export default {
  components: { Error401 },
  created() {},

  computed: {
    ...mapState('auth', ['employee'])
  },
  mounted() {
    console.log(this.employee)
    let sock = new SockJS(Paths.BASE_URL + 'ws')
    this.stompClient = Stomp.over(sock)
    this.stompClient.connect({}, frame => {
      this.afterConnect(frame)
    })
  },
  methods: {
    afterConnect(frame) {
      this.stompClient.subscribe(
        '/user/' + this.employee.id + '/updates',
        messageOutput => {
          console.log(messageOutput)
          this.receiveMessage(messageOutput)
        }
      )
    },
    receiveMessage(msg) {
      debugger
      console.log(msg)
    },
    sendMsg() {
      let msg = {
        from: '5',
        text: this.message
      }
      this.stompClient.send('/app/hello', JSON.stringify(msg), {})
    }
  },
  watch: {},
  data() {
    return {
      stompClient: null,
      message: ''
    }
  }
}
</script>

<style lang="scss" scoped></style>
