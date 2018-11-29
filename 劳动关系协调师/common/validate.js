const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();

/**
 * 验证重复登录或密码修改
 */
function validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1,url,ifGoPage) {

  app.post(API_URL, "action=CheckAccount&zcode=" + zcode + "&LoginRandom=" + LoginRandom + "&pwd=" + pwd, false, false, "", url, ifGoPage).then((res) => {
      
      wx.navigateTo({
        url: url1
      })
  }).catch((errMsg) => {
    console.log(errMsg)
  });
}

module.exports = {
  validateDPLLoginOrPwdChange:validateDPLLoginOrPwdChange
}