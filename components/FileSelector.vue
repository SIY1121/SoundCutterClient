<template>
    <div>
      <input type="file" id="file" @change="onFileSelect" style="display:none"/>
      <md-button class="md-raised" @click="damyClick">
        <md-icon>add</md-icon>
      </md-button>
    </div>
</template>

<script>
export default {
  name: "FileSelector",
  methods: {
    damyClick:function(){
      window.document.querySelector('#file').click()
    },
    onFileSelect: function(e) {
      const f = e.target.files[0];

      const file = {
        id: Date.now(),
        file: f,
        name: f.name,
        buffer: null,
        rawBuffer: null,
        dataURL: null,
        bpm: 0,
        beatLength: 0,
        startOffset: 0,
        prepared: false
      };

      this.$store.commit("addFile", file);
    }
  }
};
</script>

<style>
</style>
