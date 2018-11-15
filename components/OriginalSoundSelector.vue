<template>
    <div>
        <div v-if="file.prepared" class="flex">
          <original-sound-block v-for="(block,index) in blocks" v-bind:key="block.id" :file="file" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id" :playing="block.playing" :selecting="block.selecting" @select="blockSelect"/>
        </div>
        <div v-if="!file.prepared" class="progress">
          <div class="indeterminate"></div>
        </div>
        <button class="btn-floating waves-effect waves-light btn" @click="playPause">
          <i class="material-icons">play_arrow</i>
        </button>
        <button class="btn-floating waves-effect waves-light" @click="audioElm.currentTime = 0;playingBlockIndex = 0">
          <i class="material-icons">skip_previous</i>
        </button>
        <button class="btn-floating waves-effect waves-light" @click="selectStart">
          <i class="material-icons">first_page</i>
        </button>
        <button class="btn-floating waves-effect waves-light" @click="selectEnd">
          <i class="material-icons">last_page</i>
        </button>
        <button class="btn-floating waves-effect waves-light" @click="$emit('select',{fileId: file.id,startPos:blocks[selectStartPos].startPos,endPos:blocks[selectEndPos].endPos})">
          <i class="material-icons">vertical_align_bottom</i>
        </button>
        <audio :id="audioElmId" :src="file.dataURL"/>
        <input type="number" step="0.001" :value="file.startOffset" @input="updateStartOffset">
        <button @click="encode">encode</button>
    </div>
</template>

<script>
import OriginalSoundBlock from "~/components/OriginalSoundBlock.vue";
import analyze from "~/assets/bpmAnalyzer.js";
import saveAs from "file-saver";

export default {
  components: {
    OriginalSoundBlock
  },
  name: "OriginalSoundSelector",
  props: ["file"],
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
    prepareData: function() {
      return new Promise(resolve => {
        const reader = new FileReader();
        const reader2 = new FileReader();
        const vue = this;
        reader.onload = async f => {
          const buf = await vue.$store.state.context.decodeAudioData(
            f.target.result
          );
          vue.file.buffer = buf;
          vue.file.rawBuffer = buf.getChannelData(0);
          const res = await analyze(buf);
          vue.file.bpm = res.bpm;
          vue.file.beatLength = 60 / res.bpm;
          vue.file.startOffset = res.offset;

          reader2.onload = d => {
            vue.file.dataURL = d.target.result;
          };

          reader2.readAsDataURL(vue.file.file);

          resolve();
        };
        reader.readAsArrayBuffer(this.file.file);
      });
    },
    init: function() {
      this.blocks.splice(0, this.blocks.length);
      const buf = this.file.buffer;
      let time = 0.0;
      const beatLength = this.file.beatLength;
      this.blocks.push({
        startPos: 0,
        endPos: this.file.startOffset,
        id: this.counter,
        playing: false,
        selecting: false
      });
      time += this.file.startOffset;
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
      this.audioElm = window.document.getElementById(this.audioElmId);
      this.audioElm.onended = () => {
        this.playing = false;
        this.playingBlockIndex = 0;
      };

      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.position = this.audioElm.currentTime;
        for (let i = this.playingBlockIndex; i < this.blocks.length; i++) {
          if (
            this.blocks[i].startPos < this.position &&
            this.position < this.blocks[i].endPos
          ) {
            this.playingBlockIndex = i;
            if (!this.blocks[i].playing) this.metro();
            this.blocks[i].playing = true;
            break;
          } else {
            this.blocks[i].playing = false;
          }
        }
      }, 20);

      this.file.prepared = true;
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
      this.file.startOffset = Number(e.target.value);
      this.init();
    },
    encode: function() {
      const worker = new window.Worker("/worker.js");
      // worker.onmessage = e => {
      //   if (e.data[0] == "next1")
      //     worker.postMessage([
      //       "post",
      //       this.file.buffer.getChannelData(0),
      //       this.file.buffer.getChannelData(1)
      //     ]);
      //   else if (e.data[0] == "next2")
      //     setTimeout(() => {
      //       worker.postMessage(["done"]);
      //     }, 5000);
      //   else{
      //     saveAs(e.data[1], "test.mp3");
      //     worker.terminate();
      //   }
      // };
      // worker.postMessage(["config", this.file.buffer.sampleRate]);
      worker.onmessage = e =>{
        saveAs(e.data[0],"test.mp3");
      }
      worker.postMessage([
        this.file.buffer.sampleRate,
        this.file.buffer.getChannelData(0),
        this.file.buffer.getChannelData(1)
      ]);

      // const encoder = new Mp3LameEncoder(this.file.buffer.sampleRate,192);
      // encoder.encode([this.file.buffer.getChannelData(0),this.file.buffer.getChannelData(1)]);
      // saveAs(encoder.finish(),"test.mp3");
    }
  },
  computed: {
    audioElmId: function() {
      return "OriginalTrack" + this.file.id;
    }
  },
  mounted: async function() {
    await this.prepareData();
    this.init();
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
