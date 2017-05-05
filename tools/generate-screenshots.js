const CDP = require('chrome-remote-interface');
const file = require('fs');
let url = 'http://127.0.0.1:8080/#?x=-253.016&y=114.284&w=1280&h=799&scale=1.295&queryFile=';
// let url = 'https://www.google.com'
const viewportWidth = 1440;
const viewportHeight = 900;
const aspectRatio = viewportWidth / viewportHeight;
const imgWidth = viewportWidth;
const imgHeight = Math.floor(imgWidth / aspectRatio);
const delay = 3000
const dates = require('./dates.json')
const bus = require('ngraph.events')({});;
let currentFileName = '';

CDP(async function(client) {
  // Extract used DevTools domains.
  const {DOM, Emulation, Network, Page, Runtime} = client;

  // Enable events on domains we are interested in.
  await Page.enable();
  await DOM.enable();
  await Network.enable();

  const deviceMetrics = {
    width: viewportWidth,
    height: viewportHeight,
    deviceScaleFactor: 0,
    mobile: false,
    fitWindow: false,
  };
  await Emulation.setDeviceMetricsOverride(deviceMetrics);
  await Emulation.setVisibleSize({width: imgWidth, height: imgHeight});
  let lastIndex = 0;

  // 
  // Wait for page load event to take screenshot
  Page.loadEventFired(() => {
    console.log('load event fired');
    takeNextScreenShot().then(() => {
      console.log('all done');
      client.close();
    });
  });
  Page.navigate({url: url + dates[0]});


  function takeScreenshot() {
    setTimeout(async function() {
      const screenshot = await Page.captureScreenshot();
      const buffer = new Buffer(screenshot.data, 'base64');
      const fileName = currentFileName + '.png';
      file.writeFile(fileName, buffer, 'base64', function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log('Screenshot saved', fileName);
          bus.fire('done');
        }
      });
    }, 2500);
  }

  function takeNextScreenShot() {
    return new Promise((resolve, reject) => {
      currentFileName = dates[lastIndex];
      let currentUrl = url + currentFileName;
      console.log('navigating to ', currentUrl);
      let script = `
var c = document.querySelector('.date-selector select');
c.value = '${currentFileName}';
var evt = document.createEvent("HTMLEvents");
evt.initEvent("change", false, true);
c.dispatchEvent(evt);`

console.log('executing script\n', script);

      Runtime.evaluate({ expression: script });
      // Page.navigate({url: currentUrl});

      takeScreenshot();

      let handler = () => {
        bus.off('done', handler);
        resolve();
      }

      bus.on('done', handler);

    }).then(() => {
      if (lastIndex + 1 < dates.length) {
        lastIndex += 1;
        return takeNextScreenShot();
      }
    });
  }
}).on('error', err => {
  console.error('Cannot connect to browser:', err);
});
