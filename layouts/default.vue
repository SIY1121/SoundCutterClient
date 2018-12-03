<template>
  <div style="min-height:100vh;">
   <md-app style="min-height:100vh;">
      <md-app-toolbar class="md-primary">
        <img src="/icon.png" alt="" width="45px">
        <span class="md-title" style="flex: 1"><nuxt-link to="/" style="color:#222222;text-decoration: none;">MusicCutter beta</nuxt-link></span>
        <nuxt-link to="/"><md-button>トップ</md-button></nuxt-link>
        <nuxt-link to="/about"><md-button>アプリについて</md-button></nuxt-link>
      </md-app-toolbar>
      <md-app-content>
        <nuxt style="margin-bottom:30px"/>
        <footer>
          <share/>
        </footer>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import Share from '~/components/Share.vue';

export default{
  components:{
    Share
  }
}
</script>


<style lang="scss">
@import "~vue-material/dist/theme/engine"; // Import the theme engine

@include md-register-theme("default", (
  primary: md-get-palette-color(amber, A700), // The primary color of your application
  accent: md-get-palette-color(red, A200) // The accent or secondary color
));

@import "~vue-material/dist/theme/all"; // Apply the theme


html, body {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;

  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
.md-app-container{
  overflow: hidden;
}
footer {
  position: absolute;;
  bottom : 0;
  left: 0;
  width:100%;
}

</style>
