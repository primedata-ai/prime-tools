let browserInstances = {};
let ws = null;
let wConf = null;
let store = null;
let bcChannel = null;
let messageQueues = [];
let pollIntervalDeliveryMessageFromQueue = null;
let isShowLog = true;

let db;

let DBServices = {
  configs: {
    DB_NAME: "PRIME_DATA_CDP_ONSITE_SDK_DB",
    DB_VERSION: 1,
    QUEUE_TABLE: "QUEUE",
    TAB_INSTANT: "TAB_INSTANT"
  },
  initDatabase: function (cb) {
    let req = indexedDB.open(DBServices.configs.DB_NAME, DBServices.configs.DB_VERSION);
    req.onupgradeneeded = function (e) {
      let db = e.target.result;
      db.createObjectStore(DBServices.configs.QUEUE_TABLE, {autoIncrement: false});
      db.createObjectStore(DBServices.configs.TAB_INSTANT, {autoIncrement: false});
    };
    req.onsuccess = function (e) {
      db = req.result;
      cb();
    };
    req.onerror = function (e) {
    };
  },
  restoredMessageQueue: function (cb) {
    if (!db) return;
    let objectStore = db.transaction(DBServices.configs.QUEUE_TABLE).objectStore(DBServices.configs.QUEUE_TABLE);

    objectStore.getAll().onsuccess = function (event) {
      let data = event.target.result;
      messageQueues = data;
      OnsiteSDK.logs("Got all data", data);
      cb();
      return data;
    };
  },
  readAllDataOfTable: function (table) {
    if (!db) return;
    let objectStore = db.transaction(table).objectStore(table);
    let data = [];

    objectStore.openCursor().onsuccess = function (event) {
      let cursor = event.target.result;

      if (cursor) {
        data.push(cursor.value);
        cursor.continue();
      }
    };

    return data;
  },
  add: function (table, data, key) {
    if (!db) return;
    let request = db
      .transaction([table], "readwrite")
      .objectStore(table)
      .add(data, key);

    request.onsuccess = function (event) {
      OnsiteSDK.logs("Successfully added item: ", data, " in db");
    };

    request.onerror = function (event) {
      OnsiteSDK.logs("Add item: ", data, " fail");
    };
  },
  delete: function (table, key) {
    if (!db) return;
    let request = db
      .transaction([table], "readwrite")
      .objectStore(table)
      .delete(key);

    request.onsuccess = function (event) {
      OnsiteSDK.logs("Successfully deleted item: ", key, " in db");
    };

    request.onerror = function (event) {
      OnsiteSDK.logs("Delete item: ", key, " fail");
    };
  }
};


let OnsiteSDK = {
  logs: function (...args) {
    isShowLog && console.log(...args);
  },
  deregisterWS: function (data) {
    var request = "https://" + data.config.HOST + "/ws/deregister/" + data.storage.client_id + "/" + data.storage.x_client_id + "/" + data.storage.x_client_access_token;
    OnsiteSDK.logs("OS Logging:: handleCampaignResponse", request);
    fetch(request, {method: "POST"}).then(response => {
      if (!response || response.status !== 200) throw response;
    }).catch(error => {
      console.error("ERROR: ", error);
    });
  },
  pollCheckMessageQueue: function () {
    // let tabs = [];
    DBServices.restoredMessageQueue(function () {
      if (messageQueues.length > 0) {
        bcChannel.postMessage({type: "communication-ping"});
        bcChannel.onmessage = function (ev) {
          if (ev.data.type === "communication-pong") {
            OnsiteSDK.logs("OS Logging:: pollCheckMessageQueue from tab: ", JSON.stringify(ev.data));
            let currentTab = ev.data;

            // let numberOfTabsOpening = Object.keys(browserInstances).length;
            // OnsiteSDK.logs("OS Logging:: pollCheckMessageQueue number tabs: ", numberOfTabsOpening, ", number tab reply: ", tabs.length);

            // let tabActive = tabs.find(x => currentTab.status === "complete" && currentTab.visible === "visible" && !currentTab.isHidden);
            if (currentTab.status === "complete" && currentTab.visible === "visible" && !currentTab.isHidden) OnsiteSDK.deliveryMessageFromQueue(currentTab);
          }
        };
      }
    });
  },
  deliveryMessageForTabActive: function (message) {
    bcChannel.postMessage({type: "communication-ping"});
    bcChannel.onmessage = function (ev) {
      if (ev.data.type === "communication-pong") {
        OnsiteSDK.logs("OS Logging:: pollCheckMessageQueue from tab: ", JSON.stringify(ev.data));
        let currentTab = ev.data;
        if (currentTab.status === "complete" && currentTab.visible === "visible" && !currentTab.isHidden) {
          OnsiteSDK.logs("OS Logging:: Active tabId: ", currentTab.tabId, ", status: ", currentTab.status, ", visible:", currentTab.visible);
          browserInstances[currentTab.tabId].postMessage({...message, tabId: currentTab.tabId});
        }
      }
    };
  },
  deliveryMessageFromQueue: function (tabActive) {
    OnsiteSDK.logs("OS Logging:: Active tabId: ", tabActive.tabId, ", status: ", tabActive.status, ", visible:", tabActive.visible);
    let message = messageQueues.pop();
    browserInstances[tabActive.tabId].postMessage({...message, tabId: tabActive.tabId});
    DBServices.delete(DBServices.configs.QUEUE_TABLE, message.indexDBKey);
    OnsiteSDK.logs("OS Logging:: deliveryMessageFromQueue with message data: ", messageQueues);

    if (messageQueues.length === 0) {
      clearInterval(pollIntervalDeliveryMessageFromQueue);
      pollIntervalDeliveryMessageFromQueue = null;
      OnsiteSDK.logs("OS Logging:: pollCheckMessageQueue STOP");
    }
  },
  uuid: function () {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    let firstPart = (Math.random() * 46656) | 0;
    let secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
  },
  initConnectionBySharedWorker: function (args) {
    wConf = args.config;
    store = args.storage;
    OnsiteSDK.logs("OS Logging:: Client ID: ", store.client_id);

    const url = wConf.SSL + "://" + wConf.HOST + "/ws/register/" + store.client_id + "/" + store.x_client_id + "/" + store.x_client_access_token;
    OnsiteSDK.logs("OS Logging:: socket uri: ", url);

    // Open a connection. This is a common connection. This will be opened only once.
    ws = new WebSocket(url);
    OnsiteSDK.logs("OS Logging:: Status websocket: ", ws);

    // Create a broadcast channel to notify about state changes
    bcChannel = new BroadcastChannel(wConf.channelBroadcastName);

    // Let all connected contexts(tabs) know about state changes
    ws.onopen = () => bcChannel.postMessage({type: "WSState", state: ws.readyState});

    ws.onclose = () => bcChannel.postMessage({type: "WSState", state: ws.readyState});

    // When we receive data from the server.
    ws.onmessage = ({data}) => {
      console.log("WS onmessage", data);
      // Construct object to be passed to handlers
      const parsedData = {data: JSON.parse(data), type: "message"};

      if (!parsedData.data.from) {
        OnsiteSDK.logs("OS Logging:: campaign response from web socket: ", parsedData);

        // Broadcast to all contexts(tabs). This is because no particular id was set on the from field here. We're using this field to identify which tab sent the message
        let messageData = {...parsedData, indexDBKey: OnsiteSDK.uuid(), times: new Date().getTime()};
        OnsiteSDK.deliveryMessageForTabActive(messageData);
        // messageQueues.unshift(messageData);
        // DBServices.add(DBServices.configs.QUEUE_TABLE, messageData, messageData.indexDBKey)

        // clearInterval(pollIntervalDeliveryMessageFromQueue);
        // OnsiteSDK.logs("OS Logging:: pollCheckMessageQueue START");
        // pollIntervalDeliveryMessageFromQueue = setInterval(OnsiteSDK.pollCheckMessageQueue, 2000);

      } else {
        OnsiteSDK.logs("OS Logging:: campaign response from web socket: ", parsedData);
        // Get the port to post to using the uuid, ie send to expected tab only.
        browserInstances[parsedData.data.from].postMessage(parsedData);
      }
    };


    return ws;
  }
};

// Event handler called when a tab tries to connect to this worker.
onconnect = e => {
  const port = e.ports[0];

  // DBServices.initDatabase(function () {
  port.postMessage({state: "im live", type: "check_live"});
  port.onmessage = msg => {
    //Receive message type is closing from sdk when close tab
    if (msg.data.type === "closing") {
      delete browserInstances[msg.data.from];
      OnsiteSDK.logs("OS Logging:: Closing tab: ", msg.data);
      // DBServices.delete(DBServices.configs.TAB_INSTANT, msg.data.from)
      return;
    }

    if(msg.data.type === "check_tab_id"){
      OnsiteSDK.logs("OS Logging:: check tab id existed: ", msg.data);
      browserInstances[msg.data.data] ?
        port.postMessage({status: "NO", type: "status_tab_id"}) :
        port.postMessage({status: "YES", type: "status_tab_id"});
    }

    if(msg.data.from){
      browserInstances[msg.data.from] = port;
      OnsiteSDK.logs("OS Logging:: browserInstances list: ", Object.keys(browserInstances));
    }
    // DBServices.add(DBServices.configs.TAB_INSTANT, msg.data.from, msg.data.from);

    if (msg.data.type === "init") {
      OnsiteSDK.logs("OS Logging:: Client connect with data init: ", msg.data);
      if (!msg.data.data.storage) {
        bcChannel.postMessage({data: "Storage empty", type: "notification"});
      } else if (!wConf && !store) {
        OnsiteSDK.initConnectionBySharedWorker(msg.data.data);

        if (ws) {
          let bcChannelBackup = new BroadcastChannel("posjs_broadcast_channel");

          bcChannelBackup.onmessage = function (ev) {
            if (ev.data.type === "ack" && ws) {
              const ackData = {
                type: "ack",
                data: {
                  id: ev.data.data.id
                }
              }
              ws.send(JSON.stringify(ackData));
            }
          };
        }

      } else {
        const hello = {data: "Hello new client, Broadcast Channel ready connected", type: "setup"};
        bcChannel.postMessage(hello);
        port.postMessage({state: "Hello new client, Shared Worker ready connected", type: "setup"});
      }
    }
  };

  // We need this to notify the newly connected context to know the current state of WS connection.
  port.postMessage({state: ws ? ws.readyState : "NONE", type: "WSState"});

  // });

};