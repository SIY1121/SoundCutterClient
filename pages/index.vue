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
      <md-button class="md-raised md-accent" @click="save">Save<md-icon>save_alt</md-icon></md-button>

      <md-dialog :md-active.sync="showDialog">
        <md-dialog-title>処理中です</md-dialog-title>
        <div class="content">
          <p>
            現在書き出し処理中です。  
          </p>
        </div>
        <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
        <md-dialog-actions>
          <md-button class="md-primary" @click="showDialog = false">Cancel</md-button>
          <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        </md-dialog-actions>
      </md-dialog>
      <md-snackbar md-position="center" md-duration="5000" :md-active.sync="showSnackbar" md-persistent>
        <span>出力が完了しました</span>
        <md-button class="md-primary" @click="showSnackbar = false">OK</md-button>
      </md-snackbar>
    </div>
  </section>
</template>

<script>
import Logo from "~/components/Logo.vue";
import OrigianlSoundSelector from "~/components/OriginalSoundSelector.vue";
import SoundBlock from "~/components/SoundBlock.vue";
import FileSelector from "~/components/FileSelector.vue";
import EditArea from "~/components/EditArea.vue";
import { analyze } from "web-audio-beat-detector";
import test from "~/assets/bpmAnalyzer.js";

import saveAs from "file-saver";

export default {
  components: {
    Logo,
    SoundBlock,
    FileSelector,
    OrigianlSoundSelector,
    EditArea
  },
  data: function() {
    return {
      showDialog: false,
      showSnackbar: false,
      progress: 0,
    };
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
    save: function() {
      this.showDialog = true;
      const worker = new window.Worker("/worker.js");
      let index = 0;
      worker.onmessage = e => {
        if (e.data[0] == "done") {
          saveAs(e.data[1], "save.mp3");
          worker.terminate();
          this.showDialog = false;
          this.showSnackbar = true;
        } else {
          this.progress = index / this.$store.state.soundBlocks.length * 100;
          if (index == this.$store.state.soundBlocks.length) {
            worker.postMessage(["done"]);
            return;
          }
          const b = this.$store.state.soundBlocks[index];
          const f = this.$store.state.files.find(el => el.id == b.fileId);
          index++;
          worker.postMessage([
            "post",
            f.buffer
              .getChannelData(0)
              .slice(
                b.startPos * f.buffer.sampleRate,
                b.endPos * f.buffer.sampleRate
              ),
            f.buffer
              .getChannelData(1)
              .slice(
                b.startPos * f.buffer.sampleRate,
                b.endPos * f.buffer.sampleRate
              )
          ]);
        }
      };
      worker.postMessage([
        "config",
        this.$store.state.files[0].buffer.sampleRate
      ]);
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
