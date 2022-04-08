const puppeteer = require("puppeteer");
const chromeOptions = {
  // executablePath: 'google-chrome',
  slowMo: 10,
  headless: false,
  args: ["--no-sandbox", "--disable-setuid-sandbox", `--window-size=${1920},${1080}`],
  defaultViewport: {
    width: 1920,
    height: 1080
  }

};
const timeSleep = 4000;
const sleep = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

(async () => {
  await sleep(2000);
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();
  await page.goto("https://primedata-ai.github.io/prime-tools/pages/dev-lead-form.html");
  await sleep(2000);


  // fail
  await page.type("input[id=cdp_fname]", `PrimeTest Analytic P04`, {delay: 1});
  await page.type("input[id=cdp_phone]", `293847sfsf213`, {delay: 1});
  await page.type("input[id=cdp_email]", `nguyenlephong@primedata.ai`, {delay: 1});
  await page.click(`#btn-submit-cdp_form`);
  await page.click(`#btn-submit-cdp_form`);

  // success
  await page.click("input[id=cdp_phone]", {clickCount: 3});
  await page.type("input[id=cdp_phone]", `0985490108`, {delay: 1});
  await page.click(`#btn-submit-cdp_form`);
  await page.click(`#btn-submit-cdp_form`);
  await page.click(`#btn-submit-cdp_form`);
  await sleep(timeSleep);
  await browser.close();
})();