// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   appName: "Dengar MP",
//   production: false,
//   backend: {
//     releaseEndpoint: "http://localhost:8080/api/v1/papuan_malay/release",
//     audioEndpoint: "http://localhost:8080/api/v1/papuan_malay/audio",
//   },
//   features: {
//     dynamicContent: true,
//     bluetoothUpdate: false,
//     mediaCanCollapseWhenPlaying: true,
//   }
// };

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



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
