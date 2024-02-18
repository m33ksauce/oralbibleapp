export const environment = {
    appName: "%app-name%",
    production: true,
    backend: {
      releaseEndpoint: "https://content.oralbible.app/api/v1/%translation-key%/release",
      audioEndpoint: "https://content.oralbible.app/api/v1/%translation-key%/audio",
    },
    features: {
      dynamicContent: true,
      bluetoothUpdate: false,
      mediaCanCollapseWhenPlaying: true,
    }
  };
  