!function () {
  var follower = window.follower = window.follower || [];
  if (!follower.initialize) if (follower.invoked) window.console && console.error && console.error("PrimeDATA snippet included twice."); else {
    follower.invoked = !0;
    follower.methods = ["initOneSignal", "initWebPush", "initWebPopup", "utils", "trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "personalize", "identify", "initialize", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on", "addSourceMiddleware", "addIntegrationMiddleware", "setAnonymousId", "addDestinationMiddleware"];
    follower.factory = function (t) {
      return function () {
        var e = Array.prototype.slice.call(arguments);
        e.unshift(t);
        follower.push(e);
        return follower;
      };
    };
    for (var t = 0; t < follower.methods.length; t++) {
      var e = follower.methods[t];
      follower[e] = follower.factory(e);
    }
    follower.load = function (t, e) {
      var n = document.createElement("script");
      n.type = "text/javascript";
      n.async = !0;
      n.src = "https://dev.primedata.ai/powehi/mining.js";
      var a = document.getElementsByTagName("script")[0];
      a.parentNode.insertBefore(n, a);
      follower._loadOptions = e;
    };
    follower.SNIPPET_VERSION = "0.1.0";
    follower.load();
    const primeJsOpts = {
      scope: "JS-21575pLfqUw61M9yaGpS5SXMNR3",
      url: "https://dev.primedata.ai/powehi",
      writeKey: "21575kUfBs008DrgtRzFm4tnwyL",
      initialPageProperties: {
        pageInfo: {
          destinationURL: location.href
        }
      },
      detectAdBlock: {
        enable: true,
        bannerMessage: "You are on the ad blocker. Our feature does not work well when your ad blocker is enabled on this site. To fully enjoy the service, please disable the ad blocker on our site. We guarantee that there will be no ads on our site.",
        closeButtonLabel: "close"
      },
      webPush: {
        enabled: false,
        options: {
          showLogs: false,
          endpoint: "https://dev.primedata.ai",
          firebaseMessagingSwUrl: "./firebase-messaging-sw.js",
          firebaseConfig: {
            authDomain: "primedata-ai-c128b.firebaseapp.com",
            projectId: "primedata-ai-c128b",
            storageBucket: "primedata-ai-c128b.appspot.com",
            messagingSenderId: "615374224384",
            appId: "1:615374224384:web:b6e95abaf525c339e76ce5",
            apiKey: "AIzaSyB0cQZgXYVCTaKE6dk_voN5tle_HXNCaUU"
          }
        }
      },
      webPopup: {
        enabled: false,
        options: {
          showLogs: false,
          onsiteWorkerPath: "./posjs-worker.js",
          endpoint: "https://dev.primedata.ai"
        }
      },
      oneSignal: {
        enabled: false,
        options: {
          showLogs: false,
          embedOneSignalSDK: true,
          appId: "679be029-5cd1-4353-9d24-cc563201468e"
        }
      }
    };
    follower.initialize({"Prime Data": primeJsOpts});

    if (primeJsOpts.webPush && primeJsOpts.webPush.enabled) {
      if (firebase && !firebase.apps.length) {
        firebase.initializeApp(primeJsOpts.webPush.options.firebaseConfig);
      }
      follower.initWebPush(primeJsOpts.webPush.options);
    }

    if(primeJsOpts.webPopup && primeJsOpts.webPopup.enabled){
      follower.initWebPopup(primeJsOpts);
    }

    if (primeJsOpts.oneSignal && primeJsOpts.oneSignal.enabled) {
      follower.initOneSignal(primeJsOpts);
    }
  }
}();