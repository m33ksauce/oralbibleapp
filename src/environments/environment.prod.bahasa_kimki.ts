export const environment = {
  appName: "Af Aya Mi",
  production: true,
  backend: {
    releaseEndpoint: "https://content.oralbible.app/api/v1/bahasa_kimki/release",
    audioEndpoint: "https://content.oralbible.app/api/v1/bahasa_kimki/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
    mediaCanCollapseWhenPlaying: true,
  }
};
