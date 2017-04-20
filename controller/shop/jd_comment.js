var axios = require('axios');
var parser = require('../util/htmlParser');
var spiderSetting = require('../util/spiderSetting');

let http = require('https');
let util = require('../util/common');
let querystring = require('querystring');
let jdCookies = require('../util/jdCookies');

let config = {
    method: 'POST',
    host: 'shop.m.jd.com',
    path: '/search/searchWareAjax.json',
    headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Host': 'shop.m.jd.com',
        'Origin': 'https://shop.m.jd.com',
        'Referer': 'https://shop.m.jd.com/search/search?shopId=',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

async function getListByPage(searchPage = 1, shopId = '170564') {
    config.headers.Referer = config.headers.Referer + shopId;

    let postData = querystring.stringify({
        shopId,
        searchPage,
        searchSort: 1
    });

    return new Promise((resolve, reject) => {
        let request = http.request(config, (response) => {
            let result = '';
            response.on('data', (chunk) => {
                result += chunk;
            }).on('end', () => {
                resolve(JSON.parse(result));
            });
        }).on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
            reject(e);
        });
        request.write(postData);
        request.end();
    });


    return json;
}

// 获取商品列表
async function getGoodsList(shopId = '170564') {
    let goodsList = [];
    let totalPage = 1;
    let cookies = jdCookies.getCookies();

    await axios.post('https://mapi.m.jd.com/config/display.action?_format_=json&domain=https://shop.m.jd.com/?shopId=170564').then(res => {
        let exCookies = res.headers['set-cookie'].filter(item => {
            return item.includes('.jd.hk; Expires=');
        });
        exCookies = exCookies.map(item => item.split(';')[0])
        config.headers.Cookie = cookies + exCookies.join('; ');
    })

    for (let i = 1; i <= totalPage; i++) {
        // console.log(config.headers.Cookie);
        let record = await getListByPage(i, shopId);
        let item = record.results;
        totalPage = item.totalPage;
        // 2017-04-20
        // 此处可考虑将商品名称中属性信息分离存储
        let wareInfo = item.wareInfo.map(item => {
            item.shopId = shopId;
            return item;
        })
        goodsList = [...goodsList, ...wareInfo];
    }
    return goodsList;
}

// 获取商品评论
async function getCommentByGoods(goodsId = 10088990410) {
    let _config = {
        method: 'post',
        url: 'http://item.m.jd.com/newComments/newCommentsDetail.json',
        data: {
            wareId: 10088990410,
            offset: 0,
            num: 10,
            type: 0,
            checkParam: 'LUIPPTP'
        },
        headers: {
            Host: 'item.m.jd.com',
            "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
            Accept: 'application/json',
            "Accept-Language": 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3',
            "Accept-Encoding": 'gzip, deflate, br',
            "X-Requested-With": 'XMLHttpRequest',
            "Content-Type": 'application/x-www-form-urlencoded',
            "Referer": 'https://item.m.jd.com/product/10088990410.html',
            Connection: 'keep-alive'
        }
    }

    let cookies = jdCookies.getCookies();

    await axios.post('https://mapi.m.jd.com/config/display.action?_format_=json&domain=https://shop.m.jd.com/?shopId=170564').then(res => {
        let exCookies = res.headers['set-cookie'].filter(item => {
            return item.includes('.jd.hk; Expires=');
        });
        exCookies = exCookies.map(item => item.split(';')[0])
        _config.headers.Cookie = 'JAMCookie: true;' + cookies + exCookies.join('; ');
    });

    console.log(_config);

    console.log('-----------');

    await axios(_config).then(res => {
        console.log(res.data);
    }, e => {
        console.log(e);
    })
}

module.exports = {
    getGoodsList,
    getCommentByGoods
};