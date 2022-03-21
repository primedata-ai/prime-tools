let dataInputParam = `
### Canvas

_Sketch input using Canvas or SVG_

- [react-konva](https://github.com/konvajs/react-konva) - React Konva is a JavaScript library for drawing complex canvas graphics with bindings to the Konva Framework.
- [react-sketch](https://github.com/tbolis/react-sketch) - A Sketch tool for React based applications, backed-up by FabricJS
- [react-sketch-canvas](https://github.com/vinothpandian/react-sketch-canvas) - [Demo](https://vinoth.info/react-sketch-canvas/?path=/story/*) Freehand vector drawing tool for React using SVG as canvas. Accepts input from Mouse, touch, and graphic tablets
- [react-heat-map](https://github.com/uiwjs/react-heat-map) - A lightweight calendar heatmap react component built on SVG, customizable version of GitHub's contribution graph.

### Miscellaneous

- [react-advanced-news-ticker](https://github.com/ahmetcanaydemir/react-advanced-news-ticker) - [demo](https://www.ahmetcanaydemir.com/react-advanced-news-ticker/) - A flexible and animated vertical news ticker component
- [react-avatar-generator](https://github.com/JosephSmith127/react-avatar-generator) - Allows users to create random kaleidoscopes to be used as avatars.
- [react-awesome-query-builder](https://github.com/ukrbublik/react-awesome-query-builder) - [demo](https://ukrbublik.github.io/react-awesome-query-builder/) - Visual query builder from form fields, with SQL, MongoDB and JSON export
- [react-blur](https://github.com/javierbyte/react-blur) - React component for blurred backgrounds.
- [react-demo-tab](https://github.com/mkosir/react-demo-tab) - [demo](https://mkosir.github.io/react-demo-tab) - A React component to easily create demos of other components.
- [react-facebook](https://github.com/CherryProjects/react-facebook) - Facebook components like a Login button, Like, Share, Comments, Page or Embedded Post.
- [fastcomments-react](https://github.com/fastcomments/fastcomments-react) - [demo](<https://blog.fastcomments.com/(12-30-2019)-fastcomments-demo.html>) - FastComments component for embedding a live comment thread on a page or SPA.
- [react-pdf-viewer](https://github.com/phuoc-ng/react-pdf-viewer) - [docs](https://react-pdf-viewer.dev) - A React component to view a PDF document.
- [react-simple-chatbot](https://github.com/LucasBassetti/react-simple-chatbot) - [demo](https://github.com/anishagg17/PIzzaBuilder) - A simple chatbot component to create conversation chats.
- [react-file-reader-input](https://github.com/ngokevin/react-file-reader-input) - File input component for control for file reading styling and abstraction.
- [react-filter-control](https://github.com/komarovalexander/react-filter-control) - The React filterbuilder component for building the filter criteria in the UI.
- [react-headings](https://github.com/alexnault/react-headings) - Auto-increment your HTML headings (h1, h2, etc.) for improved accessibility and SEO, no matter your component structure, while you keep full control of what's rendered.
- [react-joyride](https://github.com/gilbarbara/react-joyride) - Create walkthroughs and guided tours for your ReactJS apps. Now with standalone tooltips!.
- [react-json-tree](https://github.com/alexkuz/react-json-tree) - React JSON Viewer Component, Extracted from redux-devtools.
- [react-resizable-and-movable](https://github.com/bokuweb/react-resizable-and-movable) - Resizable and movable component for React.
- [react-resizable-box](https://github.com/bokuweb/react-resizable-box) - Resizable component for React. #reactjs.
- [react-searchbox-awesome](https://github.com/axmz/react-searchbox-awesome) - [demo](https://axmz.github.io/react-searchbox-awesome-page/) - Minimalistic searchbox.
- [react-split-pane](https://github.com/tomkp/react-split-pane) - React split-pane component.
- [react-swipe-to-delete-ios](https://github.com/arnaudambro/react-swipe-to-delete-ios) - [demo](https://arnaudambro.github.io/react-swipe-to-delete-ios/) - To delete an item in a list the same way iOS does.
- [react-swipeable-list](https://github.com/marekrozmus/react-swipeable-list) - [demo](https://marekrozmus.github.io/react-swipeable-list/) - Configurable component to render list with swipeable items.
- [typography](https://github.com/KyleAMathews/typography.js) - A powerful toolkit for building websites with beautiful typography.
- [react-pulse-text](https://github.com/Kelsier90/React-Pulse-Text) - [demo/docs](https://kelsier90.github.io/React-Pulse-Text/) - Allows you to animate the text of any property of another component.
- [captcha-image](https://github.com/tpkahlon/captcha-image) - Allows you to generate a random captcha image with options.
- [react-pdf](https://github.com/wojtekmaj/react-pdf) - Display PDFs in your React app as easily as if they were images.
- [react-customizable-chat-bot](https://github.com/chithakumar13/react-chat-bot) - [Demo](https://chithakumar13.github.io/bot-example) - Build your own chatbot matching your brand needs in minutes.
- [@restpace/schema-form](https://github.com/restspace/schema-form) - [Demo](https://restspace.io/react/schema-form/demo) - Easily build complex forms automatically from a JSON Schema.
- [react-darkreader](https://github.com/Turkyden/react-darkreader) - 🌓 A React Hook for adding a dark / night mode to your site inspired by darkreader.
- [react-apple-signin-auth](https://github.com/A-Tokyo/react-apple-signin-auth) -  Apple signin for React using the official Apple JS SDK.
`;

function getName(linkMD) {
  let name = linkMD.match(/\[([^)]+)]/)[1];
  if (name.includes("/")) return name.substring(0, name.indexOf("/"));
  return name;
}

function getLink(linkMD) {
  return linkMD.match(/\(([^)]+)\)/)[1];
}

function extractDataFromRawText(dataInput) {
  let dataResp = [];
  let strArr = dataInput.split("\n").filter(s => !!s);
  let category = "";
  let title = "";

  for (let strArrElement of strArr) {
    if (strArrElement.charAt(0) === "#") {
      let newCategory = strArrElement.substring(strArrElement.lastIndexOf("#") + 1, strArrElement.length);
      if (newCategory !== category) {
        category = newCategory;
        title = "";
      }
    }

    if (strArrElement.charAt(0) === "_") {
      title = strArrElement.substring(1, strArrElement.length - 1);
    }

    if (strArrElement.charAt(0) === "-") {
      let items = strArrElement.split(" - ");
      let item = {
        category: category,
        title: title
      };
      if (items.length > 2) {
        item.name = getName(items[0]);
        item.git = getLink(items[0]);
        item[getName(items[1]).toLowerCase()] = getLink(items[1]);
        item.description = items[2];
      }

      if (items.length < 3) {
        item.name = getName(items[0]);
        item.git = getLink(items[0]);
        item.description = items[1];
      }

      dataResp.push(item);
    }
  }
  console.log(strArr, dataResp);
}

extractDataFromRawText(dataInputParam);