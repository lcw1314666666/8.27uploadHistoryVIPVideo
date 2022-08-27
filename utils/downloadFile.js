const request = require('request');
const fs = require('fs');
const proxyAgent = require('proxy-agent');
const ytdl = require('ytdl-core');
const path = require('path')
const { getVideoId } = require('./index.js')
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
// const COOKIE = 'HSID=A90-J1dZizy2UKJan; SSID=AWkQdbNuRBPLKyPyg; APISID=dOTWnLiPV8cah59r/AhBmQCOyR7LRg7vPr; SAPISID=I_VDFJXp0pP3QHxA/A3Rbk9WrJTMwazjlt; __Secure-1PAPISID=I_VDFJXp0pP3QHxA/A3Rbk9WrJTMwazjlt; __Secure-3PAPISID=I_VDFJXp0pP3QHxA/A3Rbk9WrJTMwazjlt; SEARCH_SAMESITE=CgQIh5YB; SID=NQiugaAflq6v7J-NdSn5OzVC_wHN91wSDAWrzdOjMc1vzExSrwmLJ7Y54FAj9cMLyeiN_w.; __Secure-1PSID=NQiugaAflq6v7J-NdSn5OzVC_wHN91wSDAWrzdOjMc1vzExSN-euanNOJ-9zTVmWWRYBgA.; __Secure-3PSID=NQiugaAflq6v7J-NdSn5OzVC_wHN91wSDAWrzdOjMc1vzExSQhtdUkb1E1CuVB7tKDDhNA.; AEC=AakniGMxoAEi0Ve5I2QES1dJ_rsjcyX2BO-3NnP2xmZiusrQv6HpGqBgfmM; eskucgkwiu72frkqawfcountry=CN; 1P_JAR=2022-08-15-03; NID=511=XFb4bC4eqQV5uMXvZ6cHXfcbTiQSDxy5FTis3E8xO4btfQKfqVb_hXx_PI-F7hocx0GGan_w5fCAGyC5VxY4c9Sy9JRGMqT1rNik8N7xAHuTLkXvYi1ezMjfA8dxH75DGMf9MavZd1fjUVmOrWgAGUvbhN_TOuVNygYW7li7JDDSZG5McrdJrEq1VYktOvWbc8p72JG5J7k8Zy75cNM62PfQFE9JZW5OyOsdOx363ZyngjmN4asKLH-2P2h--Q; DV=k_Zvn_luJPFYACJ-bZgLX55dfjT4KZhSuArK4jRoAAMAAKDFqKjTvhxqFwEAAAgH7s-UDNE6ZAAAALHLR6h06tYjHAAAAA; SIDCC=AEf-XMQSdTdkK05CU0x3a4Kff7O1q1bBtDVnnerDebQZQ0BAPs1YSflquUtZM0xwlawY0H-2i8o; __Secure-1PSIDCC=AEf-XMRtuDhEc1B4U1fJhpBou53t6V9fe1cooZypUH2UaAJxdhc6nxY1O3W2NV5Gn1URWId60jQ; __Secure-3PSIDCC=AEf-XMRR0AU9vt_G-cilKqcqUJS4XVV3Hj-70YItW6a8j6km_ZFPJ0MALWacjg9n0AZ19bJsKw'
const COOKIE = 'VISITOR_INFO1_LIVE=VvkYhm7nQ2U; PREF=tz=Asia.Shanghai; HSID=AR4e8nKnhkJZ78LEK; SSID=AOyIDvudQIQd3iqvl; APISID=dOTWnLiPV8cah59r/AhBmQCOyR7LRg7vPr; SAPISID=I_VDFJXp0pP3QHxA/A3Rbk9WrJTMwazjlt; __Secure-1PAPISID=I_VDFJXp0pP3QHxA/A3Rbk9WrJTMwazjlt; __Secure-3PAPISID=I_VDFJXp0pP3QHxA/A3Rbk9WrJTMwazjlt; LOGIN_INFO=AFmmF2swRQIgWJ9H4fXH3kX0ofgxVAqjyPEHfuiMVVsHsu3LSIYjMiUCIQCxzvbbJkbO6HnRDBtIlbPYsummJXZHisFDbspq62ZnUg:QUQ3MjNmdzFpYXptbmpUQm1oUzJhRkg2VkwzcGltX29TYy16bTR3UTRNZnpXU0R3SzhlZFJ3c0tLVm1zUHlVM2cyeXZkUGpweXYxbUliWl8tU1E4TkNhNENPeE0zSUNMdXRhMmR3R19zZGNkRjlmMWRrTldqWkNTM0ppN1RLdTdhSHRwbi15bnBzc2JGT0lCY2U3eWVqQ2kzNklxS3ViSHNR; SID=NgiugXQvQ0xyexIjDCHIVlyxw1Ypaub9Lr2vq5CBfyobENPekYRepmIwf2_7NkQqM2ESyA.; __Secure-1PSID=NgiugXQvQ0xyexIjDCHIVlyxw1Ypaub9Lr2vq5CBfyobENPeTcYWOrudy6rSjNz6nlldYg.; __Secure-3PSID=NgiugXQvQ0xyexIjDCHIVlyxw1Ypaub9Lr2vq5CBfyobENPeKYuTKu7Y3q2-Gtj8PTBf_w.; YSC=jbdx2J1IuDU; SIDCC=AEf-XMSs1BcwhIf97HlLJZGGxIkfSQ6HshEcVkDygq0ZkvhyvLZG_3E5es1UQOsQI8OGiqmJgA4; __Secure-1PSIDCC=AEf-XMRzPUndBHh1zVcFI2LcUbrPb2vBMqyqbrPV_UnuOjQhedLQRbkF5qanVm77G-InW-qfAmml; __Secure-3PSIDCC=AEf-XMQWqnzGpmFvr6A3jg0zDgcu0UOqMWyvk32ECI6MG4Z3ucNSQcFjgNifbpEki9kC7yx25k8; SIDCC=AEf-XMRiBMURBqMG9dQZ82ZNAalTEPdxQjmysfCUhSZwy7wfkIzGkHcp6ul8tLk68iKQa1YcdFk; expires=Tue, 22-Aug-2023 00:48:43 GMT; path=/; domain=.youtube.com; priority=high; __Secure-1PSIDCC=AEf-XMQey-Dh9Mct66d_bSHGWzuCtBVCpDqDF1saRB97XtsTsEN3vnxLUVT1AXqa5a9ldjDina79; expires=Tue, 22-Aug-2023 00:48:43 GMT; path=/; domain=.youtube.com; Secure; HttpOnly; priority=high; __Secure-3PSIDCC=AEf-XMQFpikinYeMolP5SfgE6CWRd-hXnJTQzxU6GP8KwDYDfnIHBFe1Ix5fkM5t7uKs8xf5l7c; expires=Tue, 22-Aug-2023 00:48:43 GMT; path=/; domain=.youtube.com; Secure; HttpOnly; priority=high; SameSite=none'
const process = require('child_process');

// const dirPath = path.join(__dirname, "files");
const proxy = 'http://127.0.0.1:8118'
const agent = new proxyAgent(proxy)
const ffmpeg = createFFmpeg({ log: true });
let videoName = ''

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

function downloadFile(uri,filename){
  videoName = filename.videoName
  var stream = fs.createWriteStream(path.join('files', filename));
  return new Promise((resolve, reject) => {
    request({
      url: uri,
      proxy: proxy
    }).pipe(stream).on('close', () => {
      resolve()
    })
  })
}

async function download1080VideoFile(newVideo) {
  const videoId = getVideoId(newVideo.videoUrl)
  const info = await ytdl.getInfo(videoId, { // 通过Id获取视频信息
    requestOptions: {
      agent,
      headers: {
        cookie: COOKIE
      },
    }
  });

  const VideoFormat = await ytdl.chooseFormat(info.formats, {
    quality: 'highestvideo', // 获取最高质量视频地址
    requestOptions: {
      agent,
      headers: {
        cookie: COOKIE
      },
    }
  })

  let audioFormats = await ytdl.filterFormats(info.formats, 'audioonly');

  return new Promise((resolve, reject) => {
    const moddleAudio = Math.floor(audioFormats.length / 2)
    Promise.all([downloadFile(VideoFormat.url, `newVideo${new Date().Format("yyyy-MM-dd")}.mp4`), downloadFile(audioFormats[moddleAudio].url,`newAudio${new Date().Format("yyyy-MM-dd")}.mp3`)]).then(async () => {
      console.log('文件下载完毕')
      // 文件下载完毕
      process.exec('node --experimental-wasm-threads utils/syntheticVideo.js',function (error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        resolve({
          ...newVideo,
          videoPath: path.join(__dirname, `../files/【老高与小沫】${new Date().Format("yyyy-MM-dd")}-1080.mp4`)
        })
      })
    })
  })
}

async function download360VideoFile(newVideo) {
  const videoId = getVideoId(newVideo.videoUrl)
  const info = await ytdl.getInfo(videoId, { // 通过Id获取视频信息
    requestOptions: {
      agent,
      headers: {
        cookie: COOKIE
      },
    }
  });

  const VideoFormat = await ytdl.chooseFormat(info.formats, {
    // quality: 'highestvideo', // 获取最高质量视频地址
    requestOptions: {
      agent,
      headers: {
        cookie: COOKIE
      },
    }
  })

  const videoDate = new Date(Number(VideoFormat.lastModified.substring(0, 13))).Format("yyyy-MM-dd")
  console.log(videoDate, 'videoDate')

  return new Promise((resolve, reject) => {
    downloadFile(VideoFormat.url, `【老高与小沫】${videoDate ? videoDate : new Date().Format("yyyy-MM-dd")}.mp4`).then(() => {
      console.log(`${newVideo.videoName}文件下载完毕`)
      resolve({
        ...newVideo,
        videoPath: path.join(__dirname, `../files/【老高与小沫】${videoDate ? videoDate : new Date().Format("yyyy-MM-dd")}.mp4`),
        videoDate: videoDate
      })
    })
  })
}

async function uploadVideoCover(newVideo) {
  return new Promise((resolve, reject) => {
    downloadFile(newVideo.videoCover, `【老高与小沫】${new Date().Format("yyyy-MM-dd")}.jpg`).then(() => {
      console.log(`${newVideo.videoName}封面下载完毕`)
      resolve({
        ...newVideo,
        videoCoverPath: path.join(__dirname, `../files/【老高与小沫】${new Date().Format("yyyy-MM-dd")}.jpg`)
      })
    })
  })
}

exports.download1080VideoFile = download1080VideoFile
exports.download360VideoFile = download360VideoFile
exports.uploadVideoCover = uploadVideoCover

