<template>
  <div class="originalSoundBlock">
    <div style="height:20px;"></div>
    <div @click="$emit('select',{startPos:startPos,index: index})">
      <div class="handle"></div>
      <canvas :id="canvasId" :width="canvasWidth" height="100px" :class="{active : playing,selecting : selecting}">
      </canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: "OriginalSoundBlock",
  props: ["startPos", "endPos", "index", "id", "playing", "selecting", "file"],
  data: function() {
    return {};
  },
  methods: {
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
    }
  },
  computed: {
    canvasId: function() {
      return "original-sound-block-canvas-" + this.id + this.file.id;
    },
    canvasWidth: function() {
      return (this.endPos - this.startPos) * this.$store.state.pixelPerSec;
    }
  },
  mounted: function() {
    this.drawWaveform();
  }
};
</script>

<style lang="scss" scoped>
.originalSoundBlock {
  overflow: initial;
}

div:hover {
  background-color: aqua;
}

canvas {
  max-width: none;
}

.active {
  background-color: yellow;
}
.selecting {
  background-color: blue;
}
</style>
