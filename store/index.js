import Vuex from 'vuex';
import mapState from 'vuex';

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      context: null,
      buffer: null,
      rawBuffer: null,
      mBuffer: null,
      playingBlock: 0,// 再生中のブロックのインデックス
      blockSpesificId: 0,// 一意のidを生成するためのもの
      bpm: 0,
      startOffset: 0.0,
      pixelPerSec: 50,
      device: ""
    }),
    mutations: {
      initContext(state, ctx) {
        state.context = ctx;
      },
      setBuffer(state, buffer) {
        state.buffer = buffer;
        state.rawBuffer = buffer.getChannelData(0);
      },
      setMBuffer(state, buffer){
        state.mBuffer = buffer;
      },
      setBpm(state, bpm) {
        state.bpm = bpm;
      },
      setStartOffset(state, offset) {
        state.startOffset = offset;
      },
      setPlayBlock(state, index) {
        state.playingBlock = index;
      },
      genBlock(state) {
        state.blockSpesificId++;
      },
      setDevice(state, d) {
        state.device = d;
      },
    },
    getters: {
      beatLength: state => {
        return 60.0 / state.bpm;
      }
    }
  })
}

export default createStore