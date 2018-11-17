<template>
    <div class="container md-elevation-2">
        <md-empty-state v-if="soundBlocks.length == 0"
          md-icon="timeline"
          md-label="タイムラインが空です"
          md-description="切り出す範囲を選択して、タイムラインにコピーします">
        </md-empty-state>
        <div v-else>
          <div><md-icon>timeline</md-icon>タイムライン</div>
          <draggable v-model="soundBlocks" :options="{handle:'.handle', clone : true}" @start="drag=true" @end="drag=false">
            <transition-group name="flip-list" tag="div" class="flex">
              <sound-block v-for="(block,index) in soundBlocks" v-bind:key="block.id" :startPos="block.startPos" :endPos="block.endPos" :index="index" :id="block.id" :file="block.file"/>
            </transition-group>
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
    soundBlocks: {
      get() {
        return this.$store.state.soundBlocks;
      },
      set(value) {
        this.$store.commit("setAllBlock", value);
      }
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
  padding:5px;
}
.flip-list-move {
  transition: transform .3s;
}
</style>
