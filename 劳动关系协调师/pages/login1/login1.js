// pages/phoneLogin/phoneLogin.js
const API_URL = 'https://xcx2.chinaplat.com/laoxie/'; //接口地址
let md5 = require('../../common/MD5.js')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: '获取验证码', //按钮文字
    currentTime: 61, //倒计时
    disabled: false, //按钮是否禁用
    phone: '' //获取到的手机栏中的值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      url: decodeURIComponent(options.url),
      ifGoPage: options.ifGoPage,
    })
  },

  /**
   * 获取手机栏input中的值
   */
  phoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  /**
   * 获取验证码input中的值
   */
  pwdInput: function(e) {
    this.setData({
      pwd: e.detail.value
    })
  },

  /**
   * 点击用户协议
   */
  viewSign: function() {
    wx.navigateTo({
      url: '/pages/subscriber/subscriber',
    })
  },

  /**
   * 点击确定按钮
   */
  confirm: function() {
    let self = this;
    let username = self.data.phone;
    let pwd = self.data.pwd;

    if(username == ""){
      wx.showToast({
        title: '用户名不能为空',
        icon:'none'
      })
      return;
    }

    if (pwd == "") {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }

    pwd = md5.md5(pwd).toLowerCase();

    let ifGoPage = self.data.ifGoPage;
    let url = self.data.url;

    app.post(API_URL, "action=Login&username=" + username + "&pwd=" + pwd,true,false,"登录中","").then((res) => {
      let user = res.data.list[0];

      wx.setStorage({
        key: 'user',
        data: user,
        success: function() {
          wx.navigateBack({
            delta: 1
          })

          if (ifGoPage == "true") {
            wx.navigateTo({
              url: url,
            })
          }
        },
        fail: function() {
          console.log('存储失败')
        }
      })
    })
  }
})