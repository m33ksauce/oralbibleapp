export const environment = {
  appName: "Ara E Weng",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/tangko/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/tangko/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
