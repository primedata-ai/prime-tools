const pushOptsSW = {
  HOST_CAMPAIGN_RESPONSE: "https://dev.primedata.ai",
};

const firebaseConfig = {
  authDomain: "primedata-ai-c128b.firebaseapp.com",
  projectId: "primedata-ai-c128b",
  storageBucket: "primedata-ai-c128b.appspot.com",
  messagingSenderId: "615374224384",
  appId: "1:615374224384:web:b6e95abaf525c339e76ce5",
  apiKey: "AIzaSyB0cQZgXYVCTaKE6dk_voN5tle_HXNCaUU",
};

if( 'function' === typeof importScripts) {
  importScripts("https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js");
  importScripts("https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js");

  if (!firebase.apps.length) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
  }

  const messaging = firebase.messaging();


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically
// and you should use data messages for custom notifications.
// For more info see:
// https://firebase.google.com/docs/cloud-messaging/concept-options
  messaging.onBackgroundMessage(function (payload) {
    // Customize notification here
    const data = payload.data;
    const actions = JSON.parse(data?.Actions || "[]").map((el, index) => ({
      ...el,
      action: "p-cta-" + index,
    }));

    const messageId = data.ID;
    const options = {
      ...data,
      body: data.Message,
      icon: data.Icon,
      image: data.Image,
      requireInteraction: data.RequireInteraction === "true" || data.RequireInteraction === true,
      vibrate: [100, 50, 100],
      actions: actions,
    };
    console.log("[firebase-messaging-sw.js] Received background message ", {
      title: data.Title,
      ...options,
    });

    self.addEventListener(
      "notificationclick",
      function (event) {
        console.log("[firebase-messaging-sw.js] On action click", event);
        handleCampaignResponse(messageId, STATUS_ENUM.CLICKED);
        event.notification.close();

        var cta = actions.find((el) => el.action === event.action);
        console.log("[firebase-messaging-sw.js] Cta", cta);
        cta && cta.deep_link && clients.openWindow(cta.deep_link);
      },
      false
    );

    handleCampaignResponse(messageId, STATUS_ENUM.VIEWED);
    self.registration.showNotification(data.Title, options);
  });

  var STATUS_ENUM = {
    VIEWED: "viewed",
    CLICKED: "clicked",
    CLOSED: "closed",
    UNSUBSCRIBED: "unsubscribed",
  };

  function handleCampaignResponse(messageId, status) {
    var request =
      pushOptsSW.HOST_CAMPAIGN_RESPONSE +
      "/v1/message/response?content_type=web_push" +
      "&message_id=" +
      messageId +
      "&status=" +
      status;
    fetch(request, {method: "POST"})
      .then((response) => {
        if (!response || response.status !== 200) throw response;
      })
      .catch((error) => {
        console.error("ERROR: ", error);
      });
  }

}