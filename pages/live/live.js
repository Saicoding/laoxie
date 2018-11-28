// pages/live/live.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    prompt:"",
    fullScreen:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sign = options.sign;
    this.setData({
      sign:sign
    })
    // let livePlayer = wx.createLivePlayerContext("player", this);
    // livePlayer.requestFullScreen({
    //   success:(res)=>{
    //     console.log(res)
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    self.ctx = wx.createLivePlayerContext('player',this);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
  * 状态改变
  */
  statechange: function (e) {
    let self = this;
    console.log('live-player code:', e.detail.code)
    let code = e.detail.code;
    let prompt = "";
    

    switch(code){
      case -2302://获取加速拉流地址失败
        prompt = "直播间断开连接";
        break;
      case 2001:
        prompt = "已经连接服务器...";
        break;
      case 2004:
        prompt = "直播开始...";
        break;
      case 2007:
        prompt = "直播准备中...";
        break;
      case 2008:
        prompt = "直播载入中...";
        break;
      case 2103:
        prompt = "网络断连, 已启动自动重连...";
        self.setData({
          isPlaying: true
        })
        break;
      case 2105:
        // prompt = "当前视频播放出现卡顿...";
        break;

      case 2009://视频分辨率改变
        
        break;

      case 2003://网络接收到首个视频数据包(IDR)
        prompt = "";
        self.setData({
          isPlaying:true
        })
        break;
      default:
        prompt = code;
        break;
    }

    self.setData({
      prompt:prompt
    })
  },

  /**
   * 发生错误时
   */
  error: function (e) {
    console.error('live-player error:', e.detail.errMsg)
  },

  /**
   * 开始播放
   */
  bindPlay: function () {
    let self = this;
    self.ctx.play({
      success: res => {
        self.setData({
          isPlaying: true
        })
      },
      fail: res => {
        console.log(res)
      }
    })
  },
  bindPause() {
    console.log('haha')
    let self = this;
    self.ctx.pause({
      success: res => {
        self.setData({
          isPlaying: false
        })
      },
      fail: res => {
        console.log('pause fail')
      }
    })
  },

  /** 
   * 点击视频显示控制面板
  */
  toogleShow: function (e) {
    console.log(e)
    let component = e.currentTarget.dataset.component
    console.log('我点击了' + component)
  },

  bindStop() {
    this.ctx.stop({
      success: res => {
        console.log('stop success')
      },
      fail: res => {
        console.log('stop fail')
      }
    })
  },
  bindResume() {
    this.ctx.resume({
      success: res => {
        console.log('resume success')
      },
      fail: res => {
        console.log('resume fail')
      }
    })
  },
  bindMute() {
    this.ctx.mute({
      success: res => {
        console.log('mute success')
      },
      fail: res => {
        console.log('mute fail')
      }
    })
  },
  bindFullScreen:function(){
    let self = this;
    self.ctx.requestFullScreen({
      success: (res) => {
        self.setData({
          fullScreen:true
        })
      }
    })
  }
})