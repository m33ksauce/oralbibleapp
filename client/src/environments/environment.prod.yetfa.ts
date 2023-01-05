export const environment = {
  appName: "Awa Ma",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/yetfa/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/yetfa/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
