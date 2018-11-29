<template>
  <div class="containerf" :style="positionStyle">
    <div class="flag" v-show="!focus" @dblclick="focus=true">
      {{ data.text }}
      <md-button @click="remove" style="position:absolute;right:0" class="md-icon-button md-dense md-accent">
        <md-icon>remove_circle</md-icon>
        <md-tooltip md-direction="bottom">削除</md-tooltip>
      </md-button>
      <md-tooltip md-direction="top">ダブルクリックで編集</md-tooltip>
    </div>
    <md-field v-show="focus" md-inline class="input">
      <label>Name</label>
      <md-input :id="inputId" v-model="data.text" @blur="focus=false" @keydown.enter="focus=false"></md-input>
    </md-field>
  </div>
</template>

<script>
export default {
  name: "Flag",
  props: ["data", "index", "file", "flags", "containerId"],
  data: function() {
    return {
      focus: false
    };
  },
  mounted(){
    this.focus = true;
  },
  methods: {
    remove: function() {
      this.flags.splice(this.index, 1);
    }
  },
  computed: {
    positionStyle: function() {
      return (
        "position:absolute;left:" +
        window.document.getElementById(
          "original-sound-block-canvas-" + this.data.block.id + this.file.id
        ).offsetLeft +
        "px"
      );
    },
    inputId: function() {
      return "flag-input" + this.file.id + this.index;
    }
  },
  watch: {
    focus: function(n, o) {
      if(n){
        setTimeout(()=>window.document.getElementById(this.inputId).select(),20);
      }else{ 
         setTimeout(()=>window.document.getElementById(this.containerId).focus(),20);
      }
    }
  }
};
</script>

<style scoped>
.containerf {
  background-color: rgba(255, 255, 255, 0.5);
  padding: 0;
  width: 100px;
}

.containerf::before{
  content: '';
  display:block;
  position:absolute;
  top:32px;
  height: 100px;
  width:2px;
  background-color:orange;
}

.flag {
  background-color: orange;
  color: white;
  border-radius: 0 10px 10px 0 / 0 10px 10px 0;
  width: 100px;
  height: 32px;
  line-height: 32px;
  overflow: hidden;
}

.input {
  min-height: none;
  margin: 0;
  padding: 0;
  border: none;
  box-shadow: none;
  width: 100px;
}
</style>
