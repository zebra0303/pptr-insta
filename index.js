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
const fs = require('fs');

(async () => {
  const opt = {
    headless: parseJSON(process.env.PPTR_HEADLESS),
    devtools: false,
    executablePath: process.env.PPTR_EXECUTABLE_PATH
  };
  const browser = await puppeteer.launch(opt);
  const page = await browser.newPage();

  // 인스타 그램에 로그인
  await page.goto(process.env.INSTA_LOGIN_URL);
  await page.waitForSelector('input[name="username"]');
  await page.focus('input[name="username"]');
  await page.keyboard.type(process.env.INSTA_ID);
  await page.focus('input[name="password"]');
  await page.keyboard.type(process.env.INSTA_PWD);
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 3000));

  // 인스타 그램 해시테그 페이지 방문해서 JSON코드 저장
  await page.goto(process.env.INSTA_HASHTAG_URL);
  const txtHashTagData = JSON.parse(await page.evaluate(() =>  {
      return document.querySelector('body').innerText;
  }));

  // 인스타그램 계정 페이지 방문해서 JSON코드 저장
  await page.goto(process.env.INSTA_ACCOUNT_URL);
  const txtAccountData = await page.evaluate(() =>  {
      return document.querySelector('body').innerText;
  });
  fs.writeFileSync('insta-account.json', txtAccountData);



  const outputJSON = {
    cntHashTag : 0,
    posts: []
  }

  // 해시테그 JSON에서 필요한 정보 추출
  const fileContentHashTag = fs.readFileSync('insta-hashtag.json', {encoding:'utf8', flag:'r'});
  const jsonDataHashTag = JSON.parse(fileContentHashTag.toString());
  outputJSON.cntHashTag = jsonDataHashTag.graphql.hashtag.edge_hashtag_to_media.count;

  // 어카운트 JSON에서 필요한 정보 추출
  const fileContentAccount = fs.readFileSync('insta-account.json', {encoding:'utf8', flag:'r'});
  const jsonDataAccount = JSON.parse(fileContentAccount.toString());
  jsonDataAccount.graphql.user.edge_owner_to_timeline_media.edges.map(edge => {
    const node = edge.node;
    const post = {
      thumbnail: {
        src: node.thumbnail_src,
        // '150x150': node.thumbnail_resources[0].src,
        // '240x240': node.thumbnail_resources[1].src,
        '320x320': node.thumbnail_resources[2].src,
        // '480x480': node.thumbnail_resources[3].src,
        '640x640': node.thumbnail_resources[4].src
      },
      caption: node.edge_media_to_caption.edges[0].node.text,
      link: `https://www.instagram.com/p/${node.shortcode}/`
    };

    outputJSON.posts.push(post);
  });

  fs.writeFileSync('insta-event.json', JSON.stringify(outputJSON));
  //console.debug(outputJSON);

  await browser.close();
})();
