export const environment = {
  production: true,
  backend: {
    releaseEndpoint: "https://us-central1-oralbibleapp.cloudfunctions.net/handler/api/v1/release",
    audioEndpoint: "https://us-central1-oralbibleapp.cloudfunctions.net/handler/api/v1/audio",
  },
  features: {
    dynamicContent: true,
    bluetoothUpdate: false,
  }
};
