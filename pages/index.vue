<template>
  <section class="container">
    <div>
      <logo/>
      <div>
        <draggable v-model="originalBlocks" :options="{handle:'.handle', clone : true}" @start="drag=true" @end="drag=false"  class="flex">
          <sound-block v-for="(block,index) in originalBlocks" v-bind:key="block.id" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id"/>
        </draggable>  
      </div>
      <div>
        <draggable v-model="soundBlocks" :options="{handle:'.handle', clone : true}" @start="drag=true" @end="drag=false"  class="flex">
          <sound-block v-for="(block,index) in soundBlocks" v-bind:key="block.id" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id"/>
        </draggable>  
      </div>
      
    </div>
  </section>
</template>

<script>
import Logo from "~/components/Logo.vue";
import SoundBlock from "~/components/SoundBlock.vue";
import draggable from "vuedraggable";
import { analyze } from "web-audio-beat-detector";

export default {
  components: {
    Logo,
    SoundBlock,
    draggable
  },
  data: function() {
    return {
      originalBlocks: [],
      soundBlocks: []
    };
  },
  mounted: function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.$store.commit("initContext", new AudioContext());
    fetch("/sanjo.mp3")
      .then(res => {
        return res.arrayBuffer();
      })
      .then(buf => {
        return this.$store.state.context.decodeAudioData(buf);
      })
      .then(buf => {
        this.$store.commit("setBuffer", buf);
        return analyze(buf);
      })
      .then(bpm => {
        this.$store.commit("setBpm", Math.round(bpm));
        this.$store.commit("setStartOffset", 1.358);
        const bl = 60.0 / this.$store.state.bpm;
        const buf = this.$store.state.buffer;
        let time = 0.0;
        let counter = 0;
        const beatLength = this.$store.getters.beatLength;
        this.originalBlocks.push({
          startPos: 0,
          endPos: this.$store.state.startOffset,
          id: counter
        });
        time += this.$store.state.startOffset;
        counter++;
        while (time < buf.duration) {
          this.originalBlocks.push({
            startPos: time,
            endPos: time + beatLength,
            id: counter
          });
          counter++;
          time += beatLength;
        }
      });
  },
  methods: {
    genSoundBlock: function(s, e) {
      this.soundBlocks.push({
        startPos: s,
        endPos: e,
        id: this.$store.state.blockSpesificId
      });
      this.$store.commit("genBlock");
    }
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  /* display: flex;
  justify-content: center;
  align-items: center;
  text-align: center; */
}

.flex {
  display: flex;
  overflow: scroll;
  flex-wrap: no-wrap;
}
</style>
