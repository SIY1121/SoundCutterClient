<template>
  <div class="save md-elevation-2">

    <md-field class="inline">
      <label>保存名</label>
      <md-input v-model="saveFileName"></md-input>
    </md-field>
    .mp3

    <div class="inline md-layout-item">
        <md-field>
          <label for="bitrate">ビットレート</label>
          <md-select v-model="bitrate" name="bitrate" id="bitrate" md-dense>
            <md-option value="128">128 kbps</md-option>
            <md-option value="192">192 kbps</md-option>
            <md-option value="256">256 kbps</md-option>
            <md-option value="320">320 kbps</md-option>
          </md-select>
        </md-field>
      </div>

    <md-button class="md-raised md-accent" @click="save" :disabled="$store.state.soundBlocks.length == 0">Save<md-icon>save_alt</md-icon></md-button>

    <md-dialog :md-active.sync="showDialog" :md-click-outside-to-close="click_outside_to_close">
      <md-dialog-title>処理中です</md-dialog-title>
      <div class="content">
        <p>
          現在書き出し処理中です。  
        </p>
      </div>
      <md-progress-bar md-mode="determinate" :md-value="progress"></md-progress-bar>
      <md-dialog-actions>
        <md-button class="md-accent" @click="cancel">Cancel</md-button>
      </md-dialog-actions>
    </md-dialog>
    <md-snackbar md-position="center" md-duration="5000" :md-active.sync="showSnackbar" md-persistent>
      <span>出力が完了しました</span>
    <md-button class="md-primary" @click="showSnackbar = false">OK</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import saveAs from "file-saver";

export default {
  name: "Save",
  data: function() {
    return {
      showDialog: false,
      click_outside_to_close: false,
      showSnackbar: false,
      progress: 0,
      bitrate: "192",
      saveFileName: "save",
      worker: null
    };
  },
  methods: {
    save: function() {
      this.showDialog = true;
      this.worker = new window.Worker("/worker.js");
      let index = 0;
      this.worker.onmessage = e => {
        if (e.data[0] == "done") {
          saveAs(e.data[1], "save.mp3");
          this.worker.terminate();
          this.showDialog = false;
          this.showSnackbar = true;
        } else {
          this.progress = (index / this.$store.state.soundBlocks.length) * 100;
          if (index == this.$store.state.soundBlocks.length) {
            this.worker.postMessage(["done"]);
            return;
          }
          const b = this.$store.state.soundBlocks[index];
          const f = this.$store.state.files.find(el => el.id == b.fileId);
          index++;
          this.worker.postMessage([
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
      this.worker.postMessage([
        "config",
        this.$store.state.files[0].buffer.sampleRate,
        Number(this.bitrate)
      ]);
    },
    cancel: function() {
      this.worker.postMessage(["cancel"]);
      this.worker.terminate();
      this.showDialog = false;
    }
  }
};
</script>

<style scoped>
.save {
  padding: 5px;
}
.inline {
  margin: 5px;
  display: inline-block;
  width: 200px;
}
</style>
