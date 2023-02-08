export const environment = {
  appName: "Cerita Alkitab Bahasa Dou",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/bahasa_dou/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/bahasa_dou/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
