<template>
  <section class="container">
    <div>
      <file-selector/>
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
import FileSelector from "~/components/FileSelector.vue";
import draggable from "vuedraggable";
import { analyze } from "web-audio-beat-detector";
import test from "~/assets/bpmAnalyzer.js";

export default {
  components: {
    Logo,
    SoundBlock,
    FileSelector,
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
  },
  computed: {
    buffer: function() {
      return this.$store.state.buffer;
    }
  },
  watch: {
    buffer: async function(n, o) {
      const res = await test(n);
      this.$store.commit("setStartOffset", res.offset);
      this.$store.commit("setBpm", Math.round(res.bpm));
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
