const pkg = require('./package')

module.exports = {
  mode: 'spa',

  /*
   ** Headers of the page
   */
  head: {
    title: "MusicCutter beta",
    meta: [{
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        hid: 'description',
        name: 'description',
        content: pkg.description
      },
      {
        property : 'og:title',
        content: 'MusicCutter'
      },
      {
        property : 'og:type',
        content: 'website'
      },
      {
        property : 'og:description',
        content : 'Web上で音楽が編集できるアプリ'
      },
      {
        property : 'og:url',
        content : 'https://music-cutter-siy.firebaseapp.com/'
      },
      {
        property : 'og:site_name',
        content : 'MusicCutter'
      },
      {
        property : 'og:image',
        content : 'https://music-cutter-siy.firebaseapp.com/icon.png'
      }
    ],
    link: [{
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Material+Icons'
      }
    ],
    script: []
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: '#fff'
  },

  /*
   ** Global CSS
   */
  css: [],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/vue-worker',
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // Doc:https://github.com/nuxt-community/modules/tree/master/packages/bulma
    '@nuxtjs/bulma',
    ['nuxt-vue-material', {
      theme: null,
    }],
    '@nuxtjs/pwa',
    ['@nuxtjs/google-analytics', {
      id: 'UA-130247603-1'
    }]
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  manifest: {
    name: "MusicCutter",
    lang: 'ja'
  },

  workbox: {
    offlineAssets:["/m.ogg","/Mp3LameEncoder.js","/worker.js"]
  },

  /*
   ** Build configuration
   */
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {

    }
  }
}
