// pages/mine/message/message.js
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp();

let animate = require('../../../common/animate.js');
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page:1, //默认请求页是1
    isHasShiti: true//是否有消息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的消息',
    })

    let self = this;
    let user = wx.getStorageSync('user');
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let page = self.data.page;
    let pagesize = 15;

    app.post(API_URL,"action=GetNotices&LoginRandom="+LoginRandom+"&zcode="+zcode+"&pagesize="+pagesize+"&page="+page,true,false,"载入中","",true,self).then((res)=>{

      let messages = res.data.list;
      let page_all = res.data.page_all;

      self.setData({
        messages:messages,
        user:user,
        page_all: page_all//总页数
      })
    })

  },
  

  /**
   * 切换是否显示信息
   */
  toogleShowMessage:function(e){
    let self = this;

    let user = self.data.user;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let index = e.currentTarget.dataset.index;
    let messages = self.data.messages;
    let message = messages[index];
    let id = message.id;
    let pages = getCurrentPages();
    let prePage = pages[pages.length-2];//上一頁


    if(message.show == undefined || message.show == false){
      message.style = "background:#f9f9f9;height:auto;";
      message.show = true;
      let flag = message.flag;

      if(flag == 0){
        //更新服務器已讀
        app.post(API_URL, "action=ChangeNoticeFlag&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&id=" + id, false, true, "").then((res) => {
          if (res.data.status == 1) {
            let nums = prePage.data.nums;
            nums--;
            prePage.setData({
              nums: nums
            })
          }
        })
      }

    }else{   
      message.show = false;
      message.flag  = 1;//每次折叠后才判定为已读
      message.style = "background:white;height:100rpx;";
    }

    self.setData({
      messages:messages
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
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
   * 滑动刷新
   */
  scrolltolower:function(){
    let self = this;
    let user = self.data.user;
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let page_all = self.data.page_all;
    let page = self.data.page;
    let messages = self.data.messages;

    page++;

    if (page > page_all) return;//如果大于总页数就返回

    let pagesize = 15;

    app.post(API_URL, "action=GetNotices&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&pagesize=" + pagesize + "&page=" + page, true, false, "载入中").then((res) => {
      let newMessages = res.data.list;

      messages.push.apply(messages, newMessages);

      self.setData({
        messages: messages,
        page: page
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})