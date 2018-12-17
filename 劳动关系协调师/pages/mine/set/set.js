// pages/mine/set/set.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storageSize:0 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
      wx.getStorage({
        key: 'user',
        success: function (res) {
        },
        fail: function (res) {
          console.log("获取数据失败");
        }
      });

    let isOn = wx.getStorageSync('turnonWifiPrompt')==0?true:false;//检查非wifi开启状态

    if (isOn === "") {//如果没有本地缓存说明是第一次载入，默认是开启状态
      isOn = true
    }

    self.setData({
      isOn:isOn
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;

    this.loginOut = this.selectComponent('#loginOut');
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
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
   * 退出登录
   */
  goOut: function () {
    // this.loginOut.showDialog();
    wx.showModal({
      content: '您确定要退出登录吗？',
      confirmColor: '#0097f5',
      success(res) {
        if (res.confirm) {
          let url = encodeURIComponent('/pages/mine/mineIndex/mineIndex');

          wx.navigateBack({})

          wx.removeStorageSync('user');
          wx.removeStorageSync('first');

        } else if (res.cancel) {

        }
      }
    })
  },

  /**
   * 开启wifi提醒
   */
  switchChange:function(e){
    let isOn = e.detail.value?0:1;
    console.log(isOn)
    wx.setStorageSync('turnonWifiPrompt', isOn);
  }
})