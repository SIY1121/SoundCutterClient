<template>
    <div>
      <input type="file" id="file" accept=".wav,.webm,.ogg,.mp3,.flac" @change="onFileSelect" style="display:none"/>
      <md-button class="md-raised md-accent" @click="damyClick">
        ファイルを選択
        <md-icon>add</md-icon>
      </md-button>
    </div>
</template>

<script>
export default {
  name: "FileSelector",
  methods: {
    damyClick: function() {
      window.document.querySelector("#file").click();
    },
    onFileSelect: function(e) {
      this.$ga.event(
        "Edit",
        "AddFile",
        "",
        this.$store.state.files.length
      );

      const f = e.target.files[0];

      const file = {
        id: Date.now(),
        file: f,
        name: f.name,
        buffer: null,
        rawBuffer: null,
        bpm: 0,
        bpmList: [],
        beatLength: 0,
        startOffset: 0,
        prepared: false,
        msg: ""
      };

      this.$store.commit("addFile", file);
    }
  }
};
</script>

<style>
</style>
