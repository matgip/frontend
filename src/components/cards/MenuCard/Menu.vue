<template>
  <div class="dimmed">
    <div class="menu_container">
      <header class="menu_header_container">
        <v-icon @click="onCloseMenu()" v-bind="vuetifyIcon">{{ fontAwesomeLeftArrow }}</v-icon>
        <h3>내 정보</h3>
        <v-icon @click="onEditUserProfile()" v-bind="vuetifyIcon">{{ fontAwesomeGear }}</v-icon>
      </header>
      <section>
        <div v-if="user" class="user_profile">
          <!-- User 정보 -->
          <span class="avatar">
            <v-avatar v-bind="vuetifyAvatar">
              <img :src="user.avatar" />
            </v-avatar>
          </span>
          <div class="user_info_container">
            <div class="user_info_nickname">{{ user.nickname }}</div>
            <div>{{ user.email }}</div>
          </div>
        </div>

        <ul class="list_service">
          <!-- 로그인 -->
          <li v-show="!user" @click="launchLogin()">
            <i class="fa-solid fa-user"><span>로그인</span></i>
          </li>
          <li v-show="user" @click="onLogout()">
            <i class="fas fa-sign-out-alt"><span>로그아웃</span></i>
          </li>
          <!-- 유저가 쓴 리뷰 목록 -->
          <li v-show="user" @click="toggleReviews()">
            <i class="fa-solid fa-comment-dots"><span>내가 작성한 리뷰</span></i
            ><i v-show="!isReviewsOpen" class="fa-solid fa-angle-right" style="color: gray;"></i>
            <i v-show="isReviewsOpen" class="fa-solid fa-angle-down" style="color: gray;"></i>
          </li>
          <div v-if="user && user.id" v-show="isReviewsOpen">
            <Reviews />
          </div>
          <!-- 공지 사항 -->
          <li @click="toggleAnnouncements()">
            <i class="fas fa-newspaper"><span>공지 사항</span></i>
            <i v-show="!isAnnouncementOpen" class="fa-solid fa-angle-right" style="color: gray;"></i>
            <i v-show="isAnnouncementOpen" class="fa-solid fa-angle-down" style="color: gray;"></i>
          </li>
          <div v-show="isAnnouncementOpen">
            <Announcement />
          </div>
        </ul>
      </section>
      <section>
        <!-- 로그인 card -->
        <div v-if="isLoginVisible === true" class="dimmed">
          <div class="dimmed_layer_login_container radius_border">
            <Login @close-login-card="closeLogin()" :on-login-success-handler="onLoginSuccess" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Login from "@/components/cards/LoginCard/Login.vue";

import { mapGetters } from "vuex";
import Reviews from "./components/Reviews.vue";
import Announcement from "./components/Announcement.vue";

export default {
  components: {
    Login,
    Reviews,
    Announcement,
  },

  data() {
    return {
      isReviewsOpen: false,
      isLoginVisible: false,
      isAnnouncementOpen: false,

      fontAwesomeLeftArrow: "fa fa-arrow-left",
      fontAwesomeGear: "fa-light fa-gear",
      vuetifyIcon: {
        color: "black",
      },
      vuetifyAvatar: {
        size: "60px",
      },
    };
  },

  computed: {
    ...mapGetters({
      user: "GET_USER",
    }),
  },

  methods: {
    onCloseMenu() {
      this.$emit("close-menu-card");
    },

    onEditUserProfile() {
      console.log("TEST");
    },

    toggleReviews() {
      this.isReviewsOpen = !this.isReviewsOpen;
    },

    toggleAnnouncements() {
      this.isAnnouncementOpen = !this.isAnnouncementOpen;
    },

    launchLogin() {
      if (this.$_isLoggedIn() === true) {
        alert("이미 로그인 되었습니다.");
        return;
      }

      this.isLoginVisible = true;
    },

    async onLogout() {
      await this.$store.dispatch("logout", "kakao");
    },

    onLoginSuccess() {
      this.closeLogin();
    },

    closeLogin() {
      this.isLoginVisible = false;
    },

    $_isLoggedIn() {
      return this.user != null;
    },
  },
};
</script>

<style>
.dimmed {
  position: fixed;

  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  z-index: 100;

  background-color: rgba(0, 0, 0, 0.3);
}

.dimmed_layer_login_container {
  position: fixed;

  top: 237.5px;
  left: 40%;
  max-width: 440px;
  width: 90%;

  margin: 20px auto;

  z-index: 100;

  background-color: white;
}

.radius_border {
  border: 2px solid #d8d8d8;
  border-radius: 10px;
  z-index: 2;
}

.menu_container {
  position: fixed;

  width: 380px;
  height: 100%;

  background-color: white;
}

.menu_header_container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 40px 20px;
}

.user_profile {
  padding: 20px;
}

span.avatar {
  display: inline-block;
}

div.user_info_container {
  position: absolute;

  left: 90px;
  top: 140px;
}

.user_info_nickname {
  font-size: 20px;
  font-weight: bold;
}

.list_service {
  padding: 40px 0px;
}

.list_service li {
  cursor: pointer;

  display: flex;
  justify-content: space-between;
  align-items: center;

  font-size: 24px;

  margin: 24px 0;
}

.list_service li i {
  margin-right: 10px;
}

.list_service li i span {
  margin-left: 10px;

  font-size: 16px;
  font-weight: 400;

  color: black;
}

@media screen and (max-width: 768px) {
  .menu_container {
    width: 90%;
  }

  .dimmed_layer_login_container {
    left: 5%;
  }
}
</style>
