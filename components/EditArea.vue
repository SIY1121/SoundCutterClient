<template>
    <div>
        <div>
        <draggable v-model="soundBlocks" :options="{handle:'.handle', clone : true}" @start="drag=true" @end="drag=false"  class="flex">
          <sound-block v-for="(block,index) in soundBlocks" v-bind:key="block.id" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id" :file="block.file"/>
        </draggable>  
      </div>
    </div>
</template>

<script>
import SoundBlock from "~/components/SoundBlock.vue";
import draggable from "vuedraggable";

export default {
  name: "EditArea",
  components: {
    SoundBlock,
    draggable
  },
  computed: {
    soundBlocks: function() {
      return this.$store.state.soundBlocks;
    }
  }
};
</script>

<style>
</style>
