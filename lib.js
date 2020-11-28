/**
 * 터미널 명령어 입력 플래그 값 리턴
 *
 * @param { string } flagName 터미널 플래그 이름 (예: --env=test 에서 env)
 * @return { string } 터미널 플래그에 매챙된 값 (예: --env=test 에서 test)
 */

exports.parseCliFlagValue = flagName => {
  const flag = process.argv
    .find(argument => argument.indexOf(`--${flagName}=`) > -1);

  if (flag) {
      return flag.slice(flag.indexOf('=') + 1);
  }

  return undefined;
};


/**
 * JSON.parse try catch문 처리
 *
 * @param { string } str JSON 문자열
 * @return { object } 파싱된 JSON Object
 */

exports.parseJSON = str => {
  let json;
  try {
    json = JSON.parse(str);
  }
  catch (err) {
    console.error(err);
  }

  return json;
};
