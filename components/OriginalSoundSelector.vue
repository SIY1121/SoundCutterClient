<template>
    <div class="container md-elevation-2" tabindex="0" @keydown.prevent.32="playPause" @keydown.prevent.exact.left="playingBlockIndex--;ctrlArrowDown();" @keydown.prevent.exact.right="playingBlockIndex++;ctrlArrowDown();" @keydown.prevent.ctrl.left="selectStart" @keydown.prevent.ctrl.right="selectEnd" @keydown.prevent.ctrl.down="copyToTimeline" @keydown.prevent.ctrl.up="flag">
        <div>
          <md-icon>music_note</md-icon>
          {{ file.name }}
        </div>
        <div v-if="file.prepared">
            <div class="md-layout-item inline">
            <md-field>
              <label for="bpm">BPM</label>
              <md-select v-model.number="file.bpm" name="bpm" id="bpm" md-dense @md-selected="analyticsBpmSelected">
                <md-option disabled>候補</md-option>
                <md-option v-for="item in file.bpmList" :key="item" :value="item"> {{ item }} </md-option>
              </md-select>
            </md-field>
          </div>
          <md-field class="inline">
            <label>開始位置</label>
            <md-input v-model.number="file.startOffset" @input="analyticsStartOffsetChanged"></md-input>
          </md-field>
          s
          <md-switch v-model="metroOn" @change="analyticsMetroSwitch">メトロノーム</md-switch>
          <md-switch v-model="trackOn" @change="analyticsFollowSwitch">追従</md-switch>
          <div>{{ displayPosition }}</div>
        </div>
        
        <div v-if="file.prepared" class="flex" :id="containerId">
          <original-sound-block v-for="(block,index) in blocks" v-bind:key="block.id" :file="file" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id" :playing="block.playing" :selecting="block.selecting" @select="blockSelect"/>
          <flag v-for="(flag,index) in flags" :key="'flag' + flag.block.id" :data="flag" :file="file" :flags="flags" :index="index" style="position:absolute"></flag>
        </div>
        <div v-if="!file.prepared">
          <p class="md-title"> {{ this.file.msg }}</p>
          <md-progress-bar md-mode="indeterminate"></md-progress-bar>
        </div>
        <div v-if="file.prepared">
          <md-button class="md-icon-button md-raised md-primary" @click="playPause">
            <md-icon v-if="playing">pause</md-icon>
            <md-icon v-else>play_arrow</md-icon>
            <md-tooltip md-direction="top">再生(SPACE)</md-tooltip>
          </md-button>
          <md-button class="md-icon-button md-raised" @click="toStart">
            <md-icon>skip_previous</md-icon>
            <md-tooltip md-direction="top">先頭に戻る</md-tooltip>
          </md-button>

          <div class="divider"></div>

          <md-button class="md-icon-button md-raised" @click="selectStart">
            <img src="/bracket-left.svg"/>
            <md-tooltip md-direction="top">始点を選択(ctrl+←)</md-tooltip>
          </md-button>
          <md-button class="md-icon-button md-raised" @click="selectEnd">
            <img src="/bracket-right.svg"/>
            <md-tooltip md-direction="top">終点を選択(ctrl+→)</md-tooltip>
          </md-button>
          <md-button class="md-icon-button md-raised md-accent" @click="copyToTimeline">
            <md-icon>vertical_align_bottom</md-icon>
            <md-tooltip md-direction="top">タイムラインにコピー(ctrl+↓)</md-tooltip>
          </md-button>

          <div class="divider"></div>

          <md-button class="md-icon-button md-raised md-accent" @click="flag">
            <md-icon>flag</md-icon>
            <md-tooltip md-direction="top">フラグを立てる(ctrl+↑)</md-tooltip>
          </md-button>
        </div>
        
    </div>
</template>

<script>
import OriginalSoundBlock from "~/components/OriginalSoundBlock.vue";
import Flag from "~/components/flag.vue";
import analyze from "~/assets/bpmAnalyzer.js";

export default {
  components: {
    OriginalSoundBlock,
    Flag
  },
  name: "OriginalSoundSelector",
  props: ["file"],
  data: function() {
    return {
      blocks: [],
      flags: [],
      source: null,
      startTime: 0,
      position: 0,
      displayPosition: "",
      mSource: null,
      audioElm: null,
      playing: false,
      intervalId: 0,
      playingBlockIndex: 0,
      selectStartPos: 0,
      selectEndPos: 0,
      counter: 0,
      metroOn: true,
      trackOn: true
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

          //vue.file.rawBuffer = buf.getChannelData(0);
          const res = await analyze(buf);
          vue.file.bpm = res.bpm[0];
          vue.file.bpmList = res.bpm;
          vue.file.beatLength = 60 / res.bpm[0];
          vue.file.startOffset = res.offset - 0.04;

          resolve();
        };
        reader.readAsArrayBuffer(this.file.file);
      });
    },
    init: function() {
      //this.flags.splice(0, this.flags.length);

      this.file.prepared = false;
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
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        if (!this.playing) return;
        this.position = this.$store.state.context.currentTime - this.startTime;
        for (let i = this.playingBlockIndex; i < this.blocks.length; i++) {
          if (
            this.blocks[i].startPos < this.position + 0.2 &&
            this.position < this.blocks[i].endPos
          ) {
            if (!this.blocks[i].playing) {
              if (this.metroOn)
                this.metro(this.blocks[i + 1].startPos - this.position);

              this.playingBlockIndex = i;

              if (this.trackOn && i - 15 >= 0) {
                this.scrollToPlayingBlock();
              }
            }
            this.blocks[i].playing = true;
            break;
          } else {
            this.blocks[i].playing = false;
          }
        }
      }, 20);
      setInterval(() => {
        this.displayPosition =
          (Math.floor(this.position / 60) >= 10
            ? Math.floor(this.position / 60)
            : "0" + Math.floor(this.position / 60)) +
          ":" +
          (Math.floor(this.position % 60) >= 10
            ? Math.floor(this.position % 60)
            : "0" + Math.floor(this.position % 60));
      }, 200);

      this.file.prepared = true;
    },
    playPause: function() {
      if (this.playing) {
        this.source.stop();
        this.playing = false;
      } else {
        this.source = this.$store.state.context.createBufferSource();
        this.source.buffer = this.file.buffer;
        this.source.onended = () => {
          if (this.playingBlockIndex == this.blocks.length - 2) {
            this.playing = false;
            this.updatePlayingBlock(0, 0);
            this.scrollToPlayingBlock();
          }
        };
        this.source.connect(this.$store.state.context.destination);
        this.source.start(0, this.position);
        this.startTime = this.$store.state.context.currentTime - this.position;
        this.playing = true;
      }
    },
    toStart: function() {
      if (this.playing) this.playPause();
      this.updatePlayingBlock(0, 0);
      this.scrollToPlayingBlock();
    },
    blockSelect: function(data) {
      if (this.playing) this.playPause();
      this.updatePlayingBlock(data.startPos, data.index);
    },
    ctrlArrowDown: function() {
      if (this.playing) this.playPause();
      const block = this.blocks[this.playingBlockIndex];
      this.updatePlayingBlock(block.startPos, this.playingBlockIndex);
      this.scrollToPlayingBlock();
    },
    updatePlayingBlock: function(startPos, index) {
      this.position = startPos;
      this.playingBlockIndex = index;
      this.blocks.forEach(el => {
        el.playing = false;
      });
      this.blocks[index].playing = true;
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
    copyToTimeline: function() {
      this.$emit("select", {
        fileId: this.file.id,
        startPos: this.blocks[this.selectStartPos].startPos,
        endPos: this.blocks[this.selectEndPos].endPos
      });
    },
    flag: function() {
      this.flags.push({
        block: this.blocks[this.playingBlockIndex],
        text: "flag"
      });
    },
    metro: function(delay) {
      this.mSource = this.$store.state.context.createBufferSource();
      this.mSource.buffer = this.$store.state.mBuffer;
      this.mSource.connect(this.$store.state.context.destination);
      this.mSource.start(delay);
    },
    scrollToPlayingBlock: function() {
      const target = window.document.getElementById(
        "original-sound-block-canvas-" +
          this.blocks[this.playingBlockIndex - 10].id +
          this.file.id
      );
      window.document
        .getElementById(this.containerId)
        .scroll(target.offsetLeft, 0);
    },
    updateStartOffset: function(e) {
      this.file.startOffset = Number(e.target.value);
      this.init();
    },
    analyticsBpmSelected: function() {
      this.$ga.event(
        "Edit",
        "ChangeBPM",
        this.bpm,
        this.file.bpmList.indexOf(this.bpm)
      );
    },
    analyticsStartOffsetChanged: function() {
      this.$ga.event("Edit", "ChangeStartOffset", "", this.file.startOffset);
    },
    analyticsMetroSwitch: function() {
      this.$ga.event("Edit", "MetroSwitch", this.metroOn);
    },
    analyticsFollowSwitch: function() {
      this.$ga.event("Edit", "FollowSwitch", this.trackOn);
    }
  },
  computed: {
    containerId: function() {
      return "OriginalTrack" + this.file.id;
    },
    bpm: function() {
      return this.file.bpm;
    },
    startOffset: function() {
      return this.file.startOffset;
    }
  },
  watch: {
    bpm: function(n, o) {
      this.file.beatLength = 60 / n;
      this.init();
    },
    startOffset: function(n, o) {
      this.init();
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
.inline {
  display: inline-block;
  width: initial;
}
.flex {
  position: relative;
  display: flex;
  flex-wrap: no-wrap;
  overflow-x: scroll;
  overflow-y: hidden;
}
.divider {
  margin-top: 10px;
  border-left:1px #aaaaaa solid;
  height: 20px;
  width:2px;
  display:inline-block;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
