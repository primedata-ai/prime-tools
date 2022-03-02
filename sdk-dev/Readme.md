# Develop SDK but only use javascript skill
**_In sdk-dev folder:_**
- `firebase-messaging-sw.js`: source code service worker for web push feature
- `posjs-worker.js`: source service worker for web onsite feature
- `index.html`: HTML file demo integration JS SDK (client)
- `miner.js`: SDK source after build

# Update SDK source: _in `sdk-dev/miner.js` file_
- *Update One Signal SDK*: goto module `115` in the end of file
- *Update Local Queue*: goto module `114` in the end of file
- *Update WebPush SDK*: goto module `113` in the end of file
- *Update WebOnsite SDK*: goto module `112`
- *Update Prime Utils*: goto module `111`
- *Update Follower Action*: goto module `108`
- *Update Analytic (Track, Identify)*: goto module `13`

# How to develop
- Open `sdk-dev/miner.js`
- Update your code develop on miner.js
- Open `sdk-dev/index.html`, *debug and complete your feature/bug*
- Run `yarn sdk-update` (support for linux, macOS)
- Then commit your source and **enjoy it**

# How to serve static site
- Install serve with command `npm install -g serve`
- Run command `server -p 1070`
- Open browser and enjoy it

## keyword search update:
- Analytics.prototype.identify
- Analytics.prototype.track
- Analytics.prototype.initWebPush
- Analytics.prototype.initWebPopup
- Analytics.prototype.utils

## Docs
- [Shared worker update](https://whatwebcando.today/articles/handling-service-worker-updates/)
- [Example shared worker communication between tabs](https://jagr.co/lessons/cross-tab-communication-in-javascript-using-a-sharedworker)
- [IndexDB](https://www.w3.org/TR/IndexedDB/#dom-idbtransactionmode-readwrite)