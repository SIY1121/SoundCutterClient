<template>
    <div class="container md-elevation-2" tabindex="0" @keydown.prevent.32="playPause">
        <md-empty-state v-if="soundBlocks.length == 0"
          md-icon="timeline"
          md-label="タイムラインが空です"
          md-description="切り出す範囲を選択して、タイムラインにコピーします">
        </md-empty-state>
        <div v-else>
          <div><md-icon>timeline</md-icon>タイムライン</div>
          <div>{{ displayPosition }}</div>
          <draggable v-model="soundBlocks" :options="{handle:'.handle', clone : true}" @start="drag=true" @end="drag=false" style="position:relative;">
            <transition-group name="flip-list" tag="div" class="flex" style="overflow-y:hidden">
              <sound-block v-for="(block,index) in soundBlocks" v-bind:key="block.id" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id" :file="block.file" :playerPlaying="playing" :playOffset="playOffset" @play="play" @end="stop"/>
              <div :key="'caret'" class="caret" :style="caretPosition"></div>
            </transition-group>
          </draggable>
          
          
          <md-button class="md-icon-button md-raised md-primary" @click="if(!playing)play();else stop();">
            <md-icon v-if="playing">pause</md-icon>
            <md-icon v-else>play_arrow</md-icon>
            <md-tooltip md-direction="top">再生(SPACE)</md-tooltip>
          </md-button>
      </div>
    </div>
</template>

<script>
import SoundBlock from "~/components/SoundBlock.vue";
import draggable from "vuedraggable";

export default {
  name: "EditArea",
  data: function() {
    return {
      playing: false,
      playOffset: 0,
      playingBlockIndex: 0,
      startTime: 0,
      position: 0,
      displayPosition: "",
      intervalId: 0
    };
  },
  components: {
    SoundBlock,
    draggable
  },
  methods: {
    playPause() {
      if (this.playing) this.stop();
      else this.play();
    },
    play: function(offset) {
      console.log(offset);
      this.playOffset = offset || 0;
      this.playing = true;
      let delay = 0;
      for (let i = 0; i < this.playOffset; i++) {
        delay +=
          this.$store.state.soundBlocks[i].endPos -
          this.$store.state.soundBlocks[i].startPos;
      }

      this.startTime = this.$store.state.context.currentTime - delay;
      this.intervalId = setInterval(() => {
        this.position = this.$store.state.context.currentTime - this.startTime;
        this.displayPosition =
          (Math.floor(this.position / 60) >= 10
            ? Math.floor(this.position / 60)
            : "0" + Math.floor(this.position / 60)) +
          ":" +
          (Math.floor(this.position % 60) >= 10
            ? Math.floor(this.position % 60)
            : "0" + Math.floor(this.position % 60));
      }, 200);
    },
    stop: function() {
      this.playing = false;
      clearInterval(this.intervalId);
    }
  },
  computed: {
    soundBlocks: {
      get() {
        return this.$store.state.soundBlocks;
      },
      set(value) {
        this.$store.commit("setAllBlock", value);
      }
    },
    caretPosition: function() {
      return (
        "left:" + (this.position * this.$store.state.pixelPerSec + 10) + "px"
      );
    }
  }
};
</script>

<style scoped>
.flex {
  position: relative;
  display: flex;
  flex-wrap: no-wrap;
  overflow-x: scroll;
}
.container {
  padding: 5px;
}

.caret {
  position: absolute;
  top: 65px;
  width: 1px;
  height: 100px;
  background-color: blue;
}

.flip-list-move {
  transition: transform 0.3s;
}
</style>
