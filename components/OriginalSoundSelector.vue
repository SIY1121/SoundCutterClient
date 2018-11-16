<template>
    <div class="container md-elevation-2">
        <div> {{ file.name }}: {{ file.bpm }}bpm </div>
        <div v-if="file.prepared" class="flex">
          <original-sound-block v-for="(block,index) in blocks" v-bind:key="block.id" :file="file" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id" :playing="block.playing" :selecting="block.selecting" @select="blockSelect"/>
        </div>
        <div v-if="!file.prepared">
          <p class="md-title"> {{ this.file.msg }}</p>
          <md-progress-bar md-mode="indeterminate"></md-progress-bar>
        </div>
        <md-button class="md-icon-button md-raised md-primary" @click="playPause">
          <md-icon>play_arrow</md-icon>
          <md-tooltip md-direction="top">再生</md-tooltip>
        </md-button>
        <md-button class="md-icon-button md-raised" @click="audioElm.currentTime = 0;playingBlockIndex = 0">
          <md-icon>skip_previous</md-icon>
          <md-tooltip md-direction="top">先頭に戻る</md-tooltip>
        </md-button>
        <md-button class="md-icon-button md-raised" @click="selectStart">
          <md-icon>first_page</md-icon>
          <md-tooltip md-direction="top">始点を選択</md-tooltip>
        </md-button>
        <md-button class="md-icon-button md-raised" @click="selectEnd">
          <md-icon>last_page</md-icon>
          <md-tooltip md-direction="top">終点を選択</md-tooltip>
        </md-button>
        <md-button class="md-icon-button md-raised md-accent" @click="$emit('select',{fileId: file.id,startPos:blocks[selectStartPos].startPos,endPos:blocks[selectEndPos].endPos})">
          <md-icon>vertical_align_bottom</md-icon>
          <md-tooltip md-direction="top">タイムラインにコピー</md-tooltip>
        </md-button>
        <audio :id="audioElmId" :src="file.dataURL"/>
        <input type="number" step="0.001" :value="file.startOffset" @input="updateStartOffset">
    </div>
</template>

<script>
import OriginalSoundBlock from "~/components/OriginalSoundBlock.vue";
import analyze from "~/assets/bpmAnalyzer.js";

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
        this.file.msg = "ファイルを読み込み中";
        const reader = new FileReader();
        const reader2 = new FileReader();
        const vue = this;
        reader.onload = async f => {
          const buf = await vue.$store.state.context.decodeAudioData(
            f.target.result
          );
          vue.file.buffer = buf;

          this.file.msg = "テンポを検出中";

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
      this.file.msg = "音声を解析中";
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
        this.position = this.audioElm.currentTime + 0.1;
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
    }
  },
  computed: {
    audioElmId: function() {
      return "OriginalTrack" + this.file.id;
    }
  },
  mounted: async function() {
    if (!this.file.prepared) {
      await this.prepareData();
    }
    this.init();
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 5px;
}
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
