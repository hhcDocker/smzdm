let read = require('../shop/sge');
let db = require('./db');

async function init() {
    let flag = await db.needUpdate('sge_trends');
    console.log('\n\n正在同步每日金价');
    if (flag) {
        let priceList = await read.getGoldPrice();
        if (priceList.length) {
            await read.saveGoldPrice(priceList);
            db.setCrawlerStatus('sge_trends');
            console.log('今日金价同步完毕!\n');
        }
    }
    console.log('今日数据已上传!\n');
}

module.exports = {
    init
};