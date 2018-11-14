<template>
    <div>
        <div class="flex">
            <original-sound-block v-for="(block,index) in blocks" v-bind:key="block.id" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id" :playing="block.playing" :selecting="block.selecting" @select="blockSelect"/>
        </div>
        <button @click="playPause">play</button>
        <button @click="audioElm.currentTime = 0;playingBlockIndex = 0">s</button>
        <button @click="selectStart">[</button>
        <button @click="selectEnd">]</button>
        <button @click="$emit('select',{startPos:blocks[selectStartPos].startPos,endPos:blocks[selectEndPos].endPos})">↓</button>
        <audio id="originalTrack" src="/sl.mp3"/>
        <input type="number" step="0.001" :value="startOffset" @input="updateStartOffset">
    </div>
</template>

<script>
import OriginalSoundBlock from "~/components/OriginalSoundBlock.vue";

export default {
  components: {
    OriginalSoundBlock
  },
  name: "OriginalSoundSelector",
  data: function() {
    return {
      blocks: [],
      mSource: null,
      audioElm: null,
      playing: false,
      intervalId: 0,
      position: 0,
      playingBlockIndex: 0,
      selectStartPos: 0,
      selectEndPos: 0,
      counter: 0
    };
  },
  methods: {
    init: function() {
      this.blocks.splice(0, this.blocks.length);
      const buf = this.$store.state.buffer;
      let time = 0.0;
      const beatLength = this.$store.getters.beatLength;
      this.blocks.push({
        startPos: 0,
        endPos: this.$store.state.startOffset,
        id: this.counter,
        playing: false,
        selecting: false
      });
      time += this.$store.state.startOffset;
      this.counter++;
      while (time < buf.duration) {
        this.blocks.push({
          startPos: time,
          endPos: time + beatLength,
          id: this.counter,
          playing: false,
          selecting: false
        });
        this.counter++;
        time += beatLength;
      }
      this.audioElm = window.document.querySelector("#originalTrack");
      this.audioElm.onended = () => {
        this.playing = false;
        this.playingBlockIndex = 0;
      };
      this.intervalId = setInterval(() => {
        this.position = this.audioElm.currentTime;
        for (let i = this.playingBlockIndex; i < this.blocks.length; i++) {
          if (
            this.blocks[i].startPos < this.position &&
            this.position < this.blocks[i].endPos
          ) {
            this.playingBlockIndex = i;
            if(!this.blocks[i].playing)
              this.metro();
            this.blocks[i].playing = true;
            break;
          } else {
            this.blocks[i].playing = false;
          }
        }
      }, 20);
    },
    playPause: function() {
      if (this.playing) {
        this.audioElm.pause();
        this.playing = false;
      } else {
        this.audioElm.play();
        this.playing = true;
        this.metro();
      }
    },
    blockSelect: function(data) {
      this.audioElm.currentTime = data.startPos;
      this.playingBlockIndex = data.index;
      this.blocks.forEach(el => {
        el.playing = false;
      });
      this.blocks[data.index].playing = true;
    },
    selectStart: function() {
      this.blocks.forEach(el => {
        el.selecting = false;
      });
      this.selectStartPos = this.playingBlockIndex;
      this.blocks[this.selectStartPos].selecting = true;
    },
    selectEnd: function() {
      this.selectEndPos = this.playingBlockIndex;
      for (let i = this.selectStartPos; i <= this.selectEndPos; i++)
        this.blocks[i].selecting = true;
    },
    metro: function() {
      this.mSource = this.$store.state.context.createBufferSource();
      this.mSource.buffer = this.$store.state.mBuffer;
      this.mSource.connect(this.$store.state.context.destination);
      this.mSource.start(0);
    },
    updateStartOffset: function(e) {
      this.$store.commit("setStartOffset", Number(e.target.value));
    }
  },
  computed: {
    bpm: function() {
      return this.$store.state.bpm;
    },
    startOffset: function() {
      return this.$store.state.startOffset;
    }
  },
  watch: {
    bpm: function(o, n) {
      this.init();
    },
    startOffset: function() {
      this.init();
    }
  }
};
</script>

<style lang="scss" scoped>
.flex {
  position: relative;
  display: flex;
  flex-wrap: no-wrap;
  overflow: scroll;
}
</style>
