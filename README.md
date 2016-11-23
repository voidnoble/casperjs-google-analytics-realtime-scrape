## 개요

구글 로그분석 실시간 현황 데이터를 주기적으로 자신의 서버에 전송

## 제작동기

구글 로그분석 실시간 현황은 사이트 운영자에게 유용한 서비스입니다.  
웹사이트의 사이드바 등에 많이 쓰이는 '실시간 TOP 10' 컴포넌트를 구현하려면
서버 등의 자원이 많이 들어갈 것인데  

이것을 손안대고 코푸는 대안이 없을까 생각하던 차에  
Google analytics API 를 사용하여 개발을 했더니
페이지뷰가 많은 사이트라서 API Quota limit 이슈에 봉착하였고  

대안으로 Headless browser 를 사용하여 해 보자!라는 생각으로  
기반이 되는 오픈소스를 검색 후 fork 하여 수정하였습니다.

## 기술 스택

* NodeJS
* CasperJS

## 설치

본 저장소를 clone 하시고
루트에 .env.json 파일을 아래 코드 참고하여 작성

```
{
    "ENV": "local",
    "GOOGLE_EMAIL": "자신의 gmail",
    "GOOGLE_PASSWD": "자신의 gmail 암호",
    "GOOGLE_ANALYTICS_TARGET_ID": "로그분석 아이디 (보고서 페이지 주소창 확인)",
    "PUSH_URL": "추출한 데이터를 전송할 URL"
}
```

콘솔창에서 npm 패키지 설치 명령

`npm install`

콘솔창에서 HTTP 서버 실행 명령

`node server.js`

앱 실행

`casperjs app.js`

## API Reference

*CasperJS*

http://docs.casperjs.org/en/latest/modules/

## Tests

Not yet

## Contributors

Not yet

## License

MIT  
(fork 원작자분이 라이센스를 정할 시 그에 따름. 그 전까지 위 라이센스 적용.)
