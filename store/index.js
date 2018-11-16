import Vuex from 'vuex';
import mapState from 'vuex';

const createStore = () => {
  return new Vuex.Store({
    state: () => ({
      context: null,
      files: [],
      soundBlocks: [],
      mBuffer: null,
      playingBlock: 0,
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
        state.soundBlocks.push(block);
      },
      setAllBlock(state, blocks) {
        state.soundBlocks.splice(0, state.soundBlocks.length);
        blocks.forEach(block =>
          state.soundBlocks.push(block)
        );
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
