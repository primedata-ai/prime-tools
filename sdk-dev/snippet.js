!function () {
  let follower = window.follower = window.follower || [];
  if (!follower.initialize) if (follower.invoked) window.console && console.error && console.error("PrimeDATA snippet included twice."); else {
    follower.invoked = !0;
    follower.methods = ["initOneSignal", "initWebPush", "initWebPopup", "utils", "trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "personalize", "identify", "initialize", "reset", "group", "track", "ready", "alias", "debug", "page", "once", "off", "on", "addSourceMiddleware", "addIntegrationMiddleware", "setAnonymousId", "addDestinationMiddleware"];
    follower.factory = function (t) {
      return function () {
        let e = Array.prototype.slice.call(arguments);
        e.unshift(t);
        follower.push(e);
        return follower;
      };
    };
    for (const element of follower.methods) follower[element] = follower.factory(element);
    follower.load = function (_t, e) {
      let n = document.createElement("script");
      n.type = "text/javascript";
      n.async = !0;
      n.src = "https://dev.primedata.ai/powehi/mining.js";
      let a = document.getElementsByTagName("script")[0];
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
      webPopup: {
        enabled: false,
        options: {
          showLogs: false,
          onsiteWorkerPath: "./posjs-worker.js",
          endpoint: "https://dev.primedata.ai"
        }
      },
    };
    follower.initialize({"Prime Data": primeJsOpts});

    if(primeJsOpts.webPopup && primeJsOpts.webPopup.enabled) follower.initWebPopup(primeJsOpts);

  }
}();