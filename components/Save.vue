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

    <md-button
      class="md-raised md-accent"
      @click="save"
      :disabled="$store.state.soundBlocks.length == 0"
    >Save
      <md-icon>save_alt</md-icon>
    </md-button>

    <md-dialog
      :md-active.sync="showDialog"
      :md-click-outside-to-close="click_outside_to_close"
      style="padding:10px"
    >
      <div v-if="!done">
        <md-dialog-title>書き出し処理中です</md-dialog-title>
        <div class="content"></div>
        <md-progress-bar :md-mode="progressMode" :md-value="progress"></md-progress-bar>

        <md-dialog-actions>
          <md-button class="md-accent" @click="cancel">Cancel</md-button>
        </md-dialog-actions>
      </div>
      <div v-else>
        <md-dialog-title>出力が完了しました</md-dialog-title>
        <md-dialog-actions>
          <md-button class="md-accent" @click="showDialog = false">OK</md-button>
        </md-dialog-actions>
      </div>
    </md-dialog>
    <md-snackbar
      md-position="center"
      md-duration="5000"
      :md-active.sync="showSnackbar"
      md-persistent
    >
      <span>出力が完了しました</span>
      <md-button class="md-primary" @click="showSnackbar = false">OK</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import saveAs from "file-saver";
import Share from "~/components/Share.vue";

export default {
  name: "Save",
  components: {
    Share
  },
  data: function() {
    return {
      showDialog: false,
      click_outside_to_close: false,
      showSnackbar: false,
      done: false,
      progress: 0,
      progressMode: "indeterminate",
      bitrate: "192",
      saveFileName: "save",
      worker: null,
      time : null
    };
  },
  methods: {
    save: function() {
      this.$ga.event("Save", "Save", this.bitrate);
      this.time = Date.now();
      this.done = false;
      this.showDialog = true;
      this.worker = new window.Worker("/worker.js");
      let index = 0;
      this.worker.onmessage = e => {
        if (e.data[0] == "done") {
          saveAs(e.data[1], this.saveFileName);
          this.worker.terminate();
          this.showDialog = false;
          this.done = true;
          this.showSnackbar = true;
          this.$ga.event("Save", "Done", Date.now() - this.time);
        } else {
          this.progressMode = "determinate";
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
      let totalSec = 0;
      this.$store.state.soundBlocks.forEach(
        el => totalSec += el.endPos - el.startPos
      );

      this.progressMode = "indeterminate";
      this.worker.postMessage([
        "config",
        this.$store.state.files[0].buffer.sampleRate,
        Number(this.bitrate),
        totalSec
      ]);
    },
    cancel: function() {
      this.worker.postMessage(["cancel"]);
      this.worker.terminate();
      this.showDialog = false;
      this.$ga.event("Save", "Cancel");
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
