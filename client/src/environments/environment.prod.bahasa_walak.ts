export const environment = {
  appName: "Cerita Alkitab Bahasa Walak",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/bahasa_walak/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/bahasa_walak/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
