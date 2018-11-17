<template>
  <section class="container">
    <md-empty-state v-if="this.files.length == 0"
      md-rounded
      md-icon="equalizer"
      md-label="プロジェクトが空です"
      md-description="楽曲を追加しましょう">
      <file-selector/>
    </md-empty-state>
    <div v-else>
      <file-selector/>
      <div>
        <origianl-sound-selector v-for="(file,index) in files" :file="file" v-bind:key="file.id" @select="selected"/>
      </div>
      <md-divider class="divider"></md-divider>
      <edit-area/>
      <save/>
    </div>
  </section>
</template>

<script>
import Logo from "~/components/Logo.vue";
import OrigianlSoundSelector from "~/components/OriginalSoundSelector.vue";
import SoundBlock from "~/components/SoundBlock.vue";
import FileSelector from "~/components/FileSelector.vue";
import EditArea from "~/components/EditArea.vue";
import Save from "~/components/Save.vue"
import { analyze } from "web-audio-beat-detector";
import test from "~/assets/bpmAnalyzer.js";


export default {
  components: {
    Logo,
    SoundBlock,
    FileSelector,
    OrigianlSoundSelector,
    EditArea,
    Save
  },
  mounted: function() {
    this.$store.commit("setDevice", this.detectDevice());
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.$store.commit("initContext", new AudioContext());
    fetch("/m.ogg")
      .then(res => {
        return res.arrayBuffer();
      })
      .then(buf => {
        return this.$store.state.context.decodeAudioData(buf);
      })
      .then(buf => {
        this.$store.commit("setMBuffer", buf);
      });
  },
  methods: {
    selected: function(data) {
      this.$store.commit("addBlock", {
        startPos: data.startPos,
        endPos: data.endPos,
        fileId: data.fileId
      });
    },
    
    detectDevice: function() {
      const ua = navigator.userAgent;
      if (
        ua.indexOf("iPhone") > 0 ||
        ua.indexOf("iPod") > 0 ||
        (ua.indexOf("Android") > 0 && ua.indexOf("Mobile") > 0)
      ) {
        return "sp";
      } else if (ua.indexOf("iPad") > 0 || ua.indexOf("Android") > 0) {
        return "tab";
      } else {
        return "other";
      }
    }
  },
  computed: {
    files: function() {
      return this.$store.state.files;
    }
  }
};
</script>

<style scoped>
.container {
  /* min-height: 100vh; */
  /* display: flex;
  justify-content: center;
  align-items: center;
  text-align: center; */
}

.divider {
  margin : 15px;
}

.content {
  padding: 10px;
}

.flex {
  display: flex;
  overflow: scroll;
  flex-wrap: no-wrap;
}
</style>
