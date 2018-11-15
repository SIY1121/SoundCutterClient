<template>
    <div>
      <label for="file" class="waves-effect waves-light btn">
        <input type="file" id="file" @change="onFileSelect" style="display:none"/>
        <i class="material-icons">add</i>
      </label>
    </div>
</template>

<script>
export default {
  name: "FileSelector",
  methods: {
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
