// pages/video/videoDetail/videoDetail.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({ //设置标题
      title: options.title,
    })
    //获取是否有登录权限
    let self = this;
    let videourl = options.videourl;
    console.log(videourl)
    self.setData({
      videourl: videourl
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.videoContext = wx.createVideoContext('myVideo');
    this.videoContext.requestFullScreen({

    })
  },

  /**
   * 全屏状态改变时
   */
  bindfullscreenchange: function(e) {
    console.log(e.detail)
    let fullScreen = e.detail.fullScreen;

    if(!fullScreen){
      wx.navigateBack({})
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

})