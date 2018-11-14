<template>
    <div>
        <input type="file" id="file" @change="onFileSelect"/>
    </div>
</template>

<script>
export default {
  name: "FileSelector",
  methods: {
    onFileSelect: function(e) {
      const f = e.target.files[0];
      const reader = new FileReader();
      const reader2 = new FileReader();
      reader.onload = async file => {
        const buf = await this.$store.state.context.decodeAudioData(
          file.target.result
        );
        this.$store.commit("setBuffer", buf);
      };
      reader.readAsArrayBuffer(f);
      reader2.onload = file =>{
          
      }
    }
  }
};
</script>

<style>
</style>
