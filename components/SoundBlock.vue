<template>
    <div class="soundBlock">
        <div>
          <md-button class="md-icon-button">
            <md-icon class="handle">drag_indicator</md-icon>
            <md-tooltip md-direction="top">ドラッグで移動</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click="remove">
            <md-icon>restore_from_trash</md-icon>
            <md-tooltip md-direction="top">削除</md-tooltip>
          </md-button>
          <div>{{ file.name }}</div>
        </div>
        <canvas :id="canvasId" :width="canvasWidth" height="100px" :class="{active : playing}" @click="playWithOffset">
        </canvas>
        <div class="time"> {{ endTime }}</div>
    </div>
</template>

<script>
export default {
  name: "SoundBlock",
  props: ["startPos", "endPos", "index", "id", "file", "playerPlaying","playOffset"],
  data: function() {
    return {
      playing: false,
      source: null,
      timeoutId: 0
    };
  },
  methods: {
    play: function(delay) {
      this.source = this.$store.state.context.createBufferSource();
      this.source.buffer = this.file.buffer;
      this.source.onended = () => {
        this.playing = false;
        if(this.$store.state.soundBlocks.length -1 == this.index)
          this.$emit("end");
      };
      this.source.connect(this.$store.state.context.destination);
      this.source.start(
        this.$store.state.context.currentTime + delay,
        this.startPos,
        this.endPos - this.startPos
      );
      this.timeoutId = setTimeout(() => (this.playing = true), delay * 1000);
    },
    playWithOffset: function(){
      this.playOffset = this.index;
      this.playerPlaying = true;
    },
    stop: function() {
      clearTimeout(this.timeoutId);
      this.source.stop();
    },
    drawWaveform: function() {
      const ctx = window.document
        .getElementById(this.canvasId)
        .getContext("2d");
      ctx.fillStyle = "red";
      const sr = this.file.buffer.sampleRate;
      const pixelPerSec = this.$store.state.pixelPerSec;
      const startSamplePos = Math.round(sr * this.startPos);
      const endSamplePos = Math.round(sr * this.endPos);
      const needSampleCount = Math.round((this.endPos - this.startPos) * sr);
      const oneBarSampleCount = Math.round(
        needSampleCount / (pixelPerSec * (this.endPos - this.startPos))
      );
      const rawSample = this.file.buffer.getChannelData(0);
      let counter = 0;
      for (let i = startSamplePos; i < endSamplePos; i += oneBarSampleCount) {
        let avg = 0;
        for (let j = 0; j < oneBarSampleCount; j++) {
          avg += Math.abs(rawSample[i + j]);
        }
        avg /= oneBarSampleCount;
        ctx.fillRect(counter, (1 - avg) * 50, 1, avg * 100);
        counter++;
      }
    },
    remove: function() {
      this.$store.commit("removeBlock", this.index);
    }
  },
  computed: {
    canvasId: function() {
      return "sound-block-canvas-" + this.id;
    },
    canvasWidth: function() {
      return (this.endPos - this.startPos) * this.$store.state.pixelPerSec;
    },
    playIndex: function() {
      return this.$store.state.playingBlock;
    },
    endTime: function() {
      let time = 0;
      for (let i = 0; i <= this.index; i++) {
        time +=
          this.$store.state.soundBlocks[i].endPos -
          this.$store.state.soundBlocks[i].startPos;
      }
      time =
        (Math.floor(time / 60) >= 10
          ? Math.floor(time / 60)
          : "0" + Math.floor(time / 60)) +
        ":" +
        (Math.floor(time % 60) >= 10
          ? Math.floor(time % 60)
          : "0" + Math.floor(time % 60));
      return time;
    }
  },
  mounted: function() {
    this.drawWaveform();
  },
  watch: {
    playerPlaying: function(n, o) {
      if (n) {
        let delay = 0;
        for (let i = this.playOffset; i < this.index; i++) {
          delay +=
            this.$store.state.soundBlocks[i].endPos -
            this.$store.state.soundBlocks[i].startPos;
        }
        console.log(delay);
        this.play(delay);
      } else {
        this.stop();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.soundBlock {
  position: relative;
}

div:hover {
  background-color: aqua;
}

.handle {
  cursor: move;
}

.time {
  position: absolute;
  right: 0;
  bottom: 0;
}

.active {
  background-color: yellow;
}

canvas {
  max-width: none;
}
</style>
