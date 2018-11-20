import Vuex from 'vuex';
import mapState from 'vuex';

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      context: null,
      files: [],
      soundBlocks: [],
      mBuffer: null,
      playingBlock: -1,
      blockSpesificId: 0,
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
      addFile(state, file) {
        state.files.push(file);
      },
      setMBuffer(state, buffer) {
        state.mBuffer = buffer;
      },
      setPlayBlock(state, index) {
        state.playingBlock = index;
      },
      addBlock(state, block) {
        state.blockSpesificId++;
        block.id = state.blockSpesificId;
        block.file = state.files.find(el => el.id === block.fileId);
        block.fadeOption = { inDuration: 0, outDuration: 0 };
        state.soundBlocks.push(block);
      },
      setAllBlock(state, blocks) {
        state.soundBlocks.splice(0, state.soundBlocks.length);
        blocks.forEach(block =>
          state.soundBlocks.push(block)
        );
      },
      removeBlock(state, index) {
        state.soundBlocks.splice(index, 1);
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
