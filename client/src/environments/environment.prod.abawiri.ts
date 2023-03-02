export const environment = {
  appName: "Alla Dabyigwa",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/abawiri/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/abawiri/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
