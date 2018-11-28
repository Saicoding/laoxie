/**
 * 通过已经过去的时间得到花费时间的字符串
 * 参数:
 *    1.goneTime  5533311
 */
function getGoneTimeStr(goneTime){
  let h = parseInt(goneTime / 3600);
  let m = parseInt((goneTime  - h * 3600) / 60);
  let s = goneTime  % 60;

  let hStr = h == 0 ? "" : h + "小时";
  let mStr = (m == 0 && h == 0) ? "" : m + "分钟";
  let sStr = s + "秒";

  return hStr + mStr + sStr;//时间字符串
}

/**
 * 得到时间对象
 * {h:18,m:16:s15}
 */
function getTime(t) {
  let h = parseInt(t / 3600);
  let m = parseInt((t - h * 3600) / 60);
  let s = t % 60;
  let time = {
    h: h,
    m: m,
    s: s
  }
  return time;
}

/**
 * 根据秒数得到时间字符串
 */

function formatTimeBySecond(t){
  let h = parseInt(t / 3600);
  let m = parseInt((t - h * 3600) / 60);
  let s = t % 60;

  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;
  return h+"小时"+m+"分"+s+"秒";
}

/**
 * 开始计时
 */
function start(myinterval,mytime){
  myinterval.interval = setInterval(function(){
    mytime.second++;
  },1000)
}

/**
 * 重新开始计时
 */
function restart(myinterval,mytime){
  clearInterval(myinterval.interval);
  mytime.second = 0;
  myinterval.interval = setInterval(function () {
    mytime.second++;
  }, 1000)
}

function formatDateTime(timeStamp){
  let  myDate = new Date();//获取系统当前时间
  myDate.setTime(timeStamp);
  let year = myDate.getFullYear();
  let month = myDate.getMonth()+1;
  let day = myDate.getDate();
  let h = myDate.getHours(); 
  h = h < 10?"0"+h:h;
  let m = myDate.getMinutes(); 
  m = m < 10?"0"+m:m;
  let s = myDate.getSeconds();
  s = s < 10?"0"+s:s;

  return h+":"+m+":"+s;
}


module.exports = {
  getGoneTimeStr: getGoneTimeStr,
  getTime: getTime,
  start: start,
  restart: restart,
  formatDateTime: formatDateTime,
  formatTimeBySecond: formatTimeBySecond
}