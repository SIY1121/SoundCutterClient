<template>
  <div>
    <div v-if="!show" @click="show=true" style="float:right">
      <md-icon >keyboard_arrow_up</md-icon>
    </div>
    <div v-show="show" style="background-color:#EEEEEE;">
      <!-- <div style="display:inline-block">
        ©2018 SIY1121
      </div> -->
      <div class="share">
        <div v-if="show" @click="show=false" style="height:20px">
        <md-icon>keyboard_arrow_down</md-icon>
        </div>
        <a href="http://b.hatena.ne.jp/entry/" class="hatena-bookmark-button" data-hatena-bookmark-layout="basic-label-counter" data-hatena-bookmark-lang="ja" title="このエントリーをはてなブックマークに追加"><img src="https://b.st-hatena.com/images/entry-button/button-only@2x.png" alt="このエントリーをはてなブックマークに追加" width="20" height="20" style="border: none;" /></a><script type="text/javascript" src="https://b.st-hatena.com/js/bookmark_button.js" charset="utf-8" async="async"></script>
        <div class="fb-share-button" data-href="https://music-cutter-siy.firebaseapp.com/" data-layout="button_count" data-size="small" data-mobile-iframe="true"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">シェア</a></div>
        <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://music-cutter-siy.firebaseapp.com/">Tweet</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Share",
  data: function() {
    return {
      show: false
    };
  },
  mounted() {
    const vue = this;
    setTimeout(() => {
      !(function(d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0],
          p = /^http:/.test(d.location) ? "http" : "https";
        if (!d.getElementById(id)) {
          js = d.createElement(s);
          js.id = id;
          js.src = p + "://platform.twitter.com/widgets.js";
          fjs.parentNode.insertBefore(js, fjs);
        }
      })(window.document, "script", "twitter-wjs");

      (function(d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        fjs.style["vertical-align"] = "top";
        js.src =
          "https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v3.2";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");

      vue.show = true;
    }, 200);
  }
};
</script>

<style>
.share {
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: -moz-flex;
  display: flex;
  -webkit-box-direction: reverse;
  -moz-box-direction: reverse;
  -webkit-box-orient: horizontal;
  -moz-box-orient: horizontal;
  -webkit-flex-direction: row-reverse;
  -moz-flex-direction: row-reverse;
  flex-direction: row-reverse;
  background-color:#EEEEEE;
}

.fb-share-button > span {
  vertical-align: top !important;
}
/* .hatena-bookmark-button-frame {
  position:absolute;
} */
</style>
