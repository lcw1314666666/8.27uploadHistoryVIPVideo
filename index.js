const request = require('request');

const fs = require('fs')
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const { getJSONList, setJSONList, transporter, scrollTimer, waitForFile, waitFileDownload } = require('./utils/index')
const { updateTop, updateAll } = require('./utils/update.js') // 更新数据
const { uploadFile } = require('./uploadVideo.js')
const { download1080VideoFile, download360VideoFile, uploadVideoCover } = require('./utils/downloadFile.js')

Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

;(async () => {
    // let api = 'https://www.youtube.com/channel/UCMUnInmOkrWN4gof9KlhNmQ/videos?view=0&sort=dd&shelf_id=0' // 站外链接
    let api = 'https://www.youtube.com/playlist?list=PLMUs_BF93V5auQ8Bz37OsF4RqpMH38kmc' // 会员影片

    const browser = await puppeteer.launch({
        slowMo: 100,    //放慢速度
        headless: false,
        defaultViewport: {width: 1440, height: 780},
        ignoreHTTPSErrors: false, //忽略 https 报错
    });
    const page = await browser.newPage();
    await page.goto(api);

    let videoList = await getJSONList('./AllVideo.json')// 全部更新
    if (videoList.length === 0) {
        const allVideoList = await updateAll(page)
        videoList = allVideoList
        await setJSONList('./AllVideo.json', allVideoList) // 保存全部
    }

    const historyVideoList = await getJSONList('./uploadJSON.json')

    const videoInfoList = videoList.filter(item => { // 过滤掉已下载的视频
        return historyVideoList.findIndex(findItem => item.videoName === findItem.videoName) === -1
    })
    if (videoInfoList.length === 0) {
        console.log('无视频数据')
        return
    }

    for (let i = 0; i < 10; i++) {

        // 下载新视频并上传
        let newVideoObj = await download360VideoFile(videoInfoList[i])
        // 下载封面
        const coverObj = await uploadVideoCover(videoInfoList[i])

        // 补充最新视频信息
        newVideoObj = {
            ...newVideoObj,
            ...coverObj
        }

        // 更新json文件
        const historyJSONInfo = await getJSONList('./downloadJSON.json') // 获取历史信息
        historyJSONInfo.push(newVideoObj)
        console.log(historyJSONInfo, 'historyJSONInfo')
        await setJSONList('./downloadJSON.json', historyJSONInfo) // 更新下载记录

        // 上传视频
        await uploadFile(browser, newVideoObj)

        const uploadHistory = await getJSONList('./uploadJSON.json') // 获取历史上传
        uploadHistory.push(newVideoObj)
        await setJSONList('./uploadJSON.json', uploadHistory) // 更新历史上传
    }
})();

// request({
//     url: 'https://www.youtube.com/channel/UCMUnInmOkrWN4gof9KlhNmQ/videos',
//     proxy: 'http://127.0.0.1:8118'
// }, function (error, response, body) {
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log(response)
// });

// 过程交给自己，结果结果还与上天！

