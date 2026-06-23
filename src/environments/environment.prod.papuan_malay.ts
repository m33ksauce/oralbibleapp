export const environment = {
  appName: "Dengar MP",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/papuan-malay/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/papuan-malay/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
