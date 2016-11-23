/**
* CasperJs 로 Google analytics realtime 을 스크랩
* https://github.com/voidnoble/casperjs-google-analytics-realtime-scrape
*
* 실행법:
casperjs/bin/casperjs app.js #{args.google_analytics_email} '#{args.google_analytics_password}' '#{args.push_url}'
*/
var env = require('./.env.json');
var casperGoogle = require('casper').create();
var casperPush = require('casper').create();

var targetId = env.GOOGLE_ANALYTICS_TARGET_ID;   // 구글 로그분석 보고서 ID
var pushUrl = env.PUSH_URL || 'http://127.0.0.1:8080/';

function getLinks() {
    var links = document.querySelectorAll('a');
    return Array.prototype.map.call(links, function (e) {
        return e.getAttribute('href')
    });
}

casperPush.start('https://google.com/', function () {
    // Do nothing
});

casperGoogle.start('https://accounts.google.com/ServiceLogin?service=analytics&passive=true&nui=1&hl=en&continue=https%3A%2F%2Fwww.google.com%2Fanalytics%2Fweb%2F%3Fhl%3Den&followup=https%3A%2F%2Fwww.google.com%2Fanalytics%2Fweb%2F%3Fhl%3Den', function () {
    this.waitForSelector('form#gaia_loginform #Email', function() {
        // search for 'casperGooglejs' from google form
        this.fill('form#gaia_loginform', {
            'Email': casperGoogle.cli.args[0] || env.GOOGLE_EMAIL
        }, true);
        this.click('#next');
        this.waitForSelector('form#gaia_loginform #Passwd', function() {
            this.fill('form#gaia_loginform', {
                'Passwd': casperGoogle.cli.args[1] || env.GOOGLE_PASSWD
            }, false);
            this.click('#signIn');
        });
    }, false);
});

casperGoogle.waitFor(function check() {
    return this.evaluate(function () {
        return getLinks().length > 2;
    });
}, function then() {
    this.echo(JSON.stringify(getLinks()));
}, function timeout() {}, 10000);

// 계정 HOME 사이트 목록들에서 대상 링크 클릭
casperGoogle.thenClick('a.TARGET-'+ targetId, function () {
    this.echo('Logged in, we\'re here: ' + this.getCurrentUrl());
});

//var selectorDestination = '.TARGET-rt-overview a[title=Overview]';     // 실시간 > 개요 링크
var selectorDestination = '.TARGET-rt-content a[title=Content]';    // 실시간 > 컨텐츠 링크

// 실시간 > 대상 메뉴 링크 클릭 후 이동된 페이지
casperGoogle.waitFor(function check() {
    return this.evaluate(function () {
        return document.querySelectorAll(selectorDestination).length;
    });
}, function then() {
    this.echo('Found realtime link');
}, function timeout() {}, 10000);

// LNB 에서 실시간 > 개요|콘텐츠 메뉴 링크 클릭
casperGoogle.thenClick(selectorDestination, function () {
    this.echo('Gone to realtime active users page: ' + this.getCurrentUrl());
});

// 실시간 페이지 뜨면
casperGoogle.waitFor(function check() {
    return this.evaluate(function () {
        return document.querySelectorAll('#ID-contentPanel-Toggler .ID-0').length;
    });
}, function then() {
    this.echo('Found realtime pageview link');
}, function timeout() {}, 10000);

// 글 상세보기 URL만 리스팅 되도록 필터링
casperGoogle.then(function () {
    this.evaluate(function () {
        document.querySelector('.ID-filterBox').value = '/article/';
        document.querySelector('.TARGET-filter').click();
    });
});

// 실시간 통계 목록 Active users 또는 pageviews 중 pageviews 선택
casperGoogle.thenClick('#ID-contentPanel-Toggler .ID-0', function () {
    this.echo('Gone to realtime pageview page: ' + this.getCurrentUrl());
});

var currentValue = null;
var contentPanel = null;

// 실시간 통계 페이지
casperGoogle.waitFor(function check() {
    return this.evaluate(function () {
        return document.querySelectorAll('#ID-overviewCounterValue').length;
    });
}, function then() {
    this.echo('Found filter. current url: ' + this.getCurrentUrl());
    // 활성 사용자 수 저장
    var sendCurrent = function () {
        if (currentValue === null || currentValue != this.fetchText('#ID-overviewCounterValue')) {
            currentValue = this.fetchText('#ID-overviewCounterValue');

            if (contentPanel === null || contentPanel != this.getHTML('#ID-contentPanel-Table')) {
                contentPanel = this.getHTML('#ID-contentPanel-Table');
            }

            this.echo('Sending current value: ' + currentValue + ' to ' + pushUrl);
            // `value=값` 으로 POST 전송됨
            casperPush.open(pushUrl, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                encoding: 'utf8',
                data: {
                    'activeUserCount': currentValue,
                    'topContents': contentPanel
                }
            }).then(function() {
                this.echo('Sent');
            });
        }
    }.bind(this);
    setInterval(sendCurrent, 1000); // 1초마다 실행
}, function timeout() {}, 10000);

// 실행
casperGoogle.run(function () {

});
// 실행
casperPush.run(function () {

});
