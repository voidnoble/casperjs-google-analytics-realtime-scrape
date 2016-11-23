/**
* HTTP POST Server
*/
const http = require('http');
let options = {
    host: '127.0.0.1',
    path: '/',
    port: '8080',
    method: 'POST'
};

http.createServer((req, res) => {
    let data = '';

    // 클라이언트 요청 데이터 수신 이벤트
    req.on('data', (chunk) => {
        data += chunk;
    });
    // 클라이언트 요청이 끝나면
    req.on('end', () => {
        // 요청 데이터 결과
        //data = '{"'+ data.replace('=', '":"') +'"}';  // value=전송값 형식
        let reqObj = JSON.parse(data);
        // 응답 데이터 생성
        let resObj = {
            activeUserCount: reqObj.activeUserCount,
            topContents: reqObj.topContents
        };

        // 문자열로 변환
        let resString = JSON.stringify(resObj);
        // 콘솔에 출력
        console.log(resString);
        /* 응답 반환
        res.writeHead(200);
        res.end(resString);*/
    });
}).listen(options.port);
