// pages/hasNoErrorShiti/hasNoErrorShiti.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();
// start雷达图初始化数据
let windowWidth = wx.getSystemInfoSync().windowWidth; //窗口高度
let validate = require('../../../common/validate.js');

let buttonClicked = false;


Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
  },

  onReady: function() {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight,
          windowWidth: windowWidth,
        })
      }
    });
  },
  /**
   * 设置页面
   */
  GOset: function() {
    if (buttonClicked) return;
    buttonClicked = true;
    wx.navigateTo({
      url: '/pages/mine/set/set',
    })
  },

  /**
   * 导航到消息页面
   */
  GOmessage: function() {
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;

    let url = encodeURIComponent('/pages/mine/message/message');
    let url1 = '/pages/mine/message/message';

    let user = self.data.user;
    let zcode = user.zcode;
    let LoginRandom = user.Login_random;
    let pwd = user.pwd

    validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true) //验证重复登录

  },
  /**
   * 在返回页面的时候
   */
  onShow: function() {
    let self = this;
    buttonClicked = false;
    let user = wx.getStorageSync('user');

    if (user != "") {
      let LoginRandom = user.Login_random;
      let zcode = user.zcode;
      let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

      app.post(API_URL, "action=GetNoticesNums&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "", url).then((res) => {
        let nums = res.data.nums;

        self.setData({
          nums: nums,
          user:user
        })

        if(nums > 0){
          wx.setTabBarBadge({
            index: 2,
            text: nums.toString(),
          })
        }else{
          wx.removeTabBarBadge({
            index: 2,
          })
        }

      })
    } else { //如果没有登录
      //把消息图标调成没有
      wx.setTabBarBadge({
        index: 2,
        text: "",
      })

      let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

      wx.navigateTo({
        url: '/pages/login1/login1?url=' + url + '&ifGoPage=false',
      })
    }

    this.setData({
      user: user
    })
  },
})