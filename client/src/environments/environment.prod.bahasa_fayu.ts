export const environment = {
  appName: "Cerita Alkitab Bahasa Fayu",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/bahasa_fayu/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/bahasa_fayu/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
