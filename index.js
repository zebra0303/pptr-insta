const { parseCliFlagValue, parseJSON } = require('./lib');
// 입력 오류 체킹
const environment = parseCliFlagValue('env');

if(environment !== 'prod' && environment !== 'test') {
    let msg = '!!Error!! --env 플래그가 잘못 되었습니다.\n';
    msg += '바른예) node index.js --env=test';

    console.error(msg);
    return false;
}

require('dotenv').config({path: `.env.${environment}`});

const puppeteer = require('puppeteer-core');

(async () => {
  const opt = {
    headless: parseJSON(process.env.PPTR_HEADLESS),
    devtools: false,
    executablePath: process.env.PPTR_EXECUTABLE_PATH
  };
  const browser = await puppeteer.launch(opt);
  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/accounts/login/');
  await page.waitForSelector('input[name="username"]');
  await page.focus('input[name="username"]');
  await page.keyboard.type(process.env.INSTA_ID);
  await page.focus('input[name="password"]');
  await page.keyboard.type(process.env.INSTA_PWD);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 5000));

  // await page.goto('https://instagram.com');
  // await page.screenshot({ path: 'instagram.png', fullPage:true });

  await browser.close();
})();
