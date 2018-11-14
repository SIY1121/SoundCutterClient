<template>
  <section class="container">
    <div>
      <logo/>
      <origianl-sound-selector @select="append"/>
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
import OrigianlSoundSelector from "~/components/OriginalSoundSelector.vue";
import SoundBlock from "~/components/SoundBlock.vue";
import draggable from "vuedraggable";
import { analyze } from "web-audio-beat-detector";
import test from "~/assets/bpmAnalyzer.js";

export default {
  components: {
    Logo,
    SoundBlock,
    OrigianlSoundSelector,
    draggable
  },
  data: function() {
    return {
      soundBlocks: []
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

    fetch("/bd.mp3")
      .then(res => {
        return res.arrayBuffer();
      })
      .then(buf => {
        return this.$store.state.context.decodeAudioData(buf);
      })
      .then(buf => {
        this.$store.commit("setBuffer", buf);
        return test(buf);
      })
      .then(res => {
        this.$store.commit("setStartOffset", res.offset);
        //this.$store.commit("setStartOffset", 1.358);
        //this.$store.commit("setStartOffset", 0.770);
        this.$store.commit("setBpm", Math.round(res.bpm));
        // const bl = 60.0 / this.$store.state.bpm;
        // const buf = this.$store.state.buffer;
        // let time = 0.0;
        // let counter = 0;
        // const beatLength = this.$store.getters.beatLength;
        // this.originalBlocks.push({
        //   startPos: 0,
        //   endPos: this.$store.state.startOffset,
        //   id: counter
        // });
        // time += this.$store.state.startOffset;
        // counter++;
        // while (time < buf.duration) {
        //   this.originalBlocks.push({
        //     startPos: time,
        //     endPos: time + beatLength,
        //     id: counter
        //   });
        //   counter++;
        //   time += beatLength;
        // }
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
    },
    append: function(data) {
      this.genSoundBlock(data.startPos, data.endPos);
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
