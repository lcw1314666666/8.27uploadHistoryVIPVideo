const path = require('path')
const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');
const ffmpeg = createFFmpeg({ log: true });
const fs = require('fs');

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
    await ffmpeg.load();
    const dataInputVideo = await fetchFile(`files/newVideo${new Date().Format("yyyy-MM-dd")}.mp4`);
    const dataInputAudio = await fetchFile(`files/newAudio${new Date().Format("yyyy-MM-dd")}.mp3`);

    ffmpeg.FS('writeFile', `newVideo${new Date().Format("yyyy-MM-dd")}.mp4`, dataInputVideo);
    ffmpeg.FS('writeFile', `newAudio${new Date().Format("yyyy-MM-dd")}.mp3`, dataInputAudio);

// ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac -strict experimental -map 0:v:0 -map 1:a:0 output.mp4
    await ffmpeg.run('-i', `newVideo${new Date().Format("yyyy-MM-dd")}.mp4`, '-i', `newAudio${new Date().Format("yyyy-MM-dd")}.mp3`, '-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental', '-map', '0:v:0', '-map', '1:a:0', 'output.mp4');
    await fs.promises.writeFile(`files/【老高与小沫】${new Date().Format("yyyy-MM-dd")}-1080.mp4`, ffmpeg.FS('readFile', 'output.mp4'));
    process.exit(0);
    console.log('文件合成完毕')
})();
