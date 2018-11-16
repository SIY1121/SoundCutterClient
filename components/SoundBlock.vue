<template>
    <div>
        <div>
          <md-button class="md-icon-button">
            <md-icon class="handle">drag_indicator</md-icon>
            <md-tooltip md-direction="top">ドラッグで移動</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click="remove">
            <md-icon>restore_from_trash</md-icon>
            <md-tooltip md-direction="top">削除</md-tooltip>
          </md-button>
        </div>
        <canvas :id="canvasId" :width="canvasWidth" height="100px" :class="{active : playing}" @click="play">
        </canvas>
    </div>
</template>

<script>
export default {
  name: "SoundBlock",
  props: ["startPos", "endPos", "index", "id", "file"],
  data: function() {
    return {
      playing: false
    };
  },
  methods: {
    play: function() {
      const source = this.$store.state.context.createBufferSource();
      source.buffer = this.file.buffer;
      source.onended = () => {
        this.playing = false;
        this.$store.commit("setPlayBlock", this.index + 1);
      };
      source.connect(this.$store.state.context.destination);
      source.start(0, this.startPos, this.endPos - this.startPos);
      this.playing = true;
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
      const rawSample = this.file.rawBuffer;
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
    }
  },
  mounted: function() {
    this.drawWaveform();
  },
  watch: {
    playIndex: function(n, o) {
      if (this.index == n) {
        this.play();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: inline-block;
}

div:hover {
  background-color: aqua;
}

.handle {
  cursor: move;
}

.active {
  background-color: yellow;
}

canvas {
  max-width: none;
}
</style>
