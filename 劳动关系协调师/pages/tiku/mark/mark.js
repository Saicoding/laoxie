// pages/tiku/mark/mark.js
const API_URL = 'https://xcx2.chinaplat.com/laoxie/'; //接口地址
let common = require('../../../common/shiti.js');

let animate = require('../../../common/animate.js')
let easeOutAnimation = animate.easeOutAnimation();
let easeInAnimation = animate.easeInAnimation();
let isFold = true; //默认都是折叠的
let post = require('../../../common/post.js');

const util = require('../../../utils/util.js')
//把winHeight设为常量，不要放在data里（一般来说不用于渲染的数据都不能放在data里）
const winHeight = wx.getSystemInfoSync().windowHeight
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: 0, //书的编号,默认为0
    rightNum: 0, //正确答案数
    wrongNum: 0, //错误答案数
    isLoaded: false, //是否已经载入完毕,用于控制过场动画
    cl_question_hidden: false, //材料题是否隐藏题目
    checked: false, //选项框是否被选择
    doneAnswerArray: [], //已做答案数组
    markAnswerItems: [], //设置一个空数组

    isModelReal: false, //是不是真题或者押题
    isSubmit: false, //是否已提交答卷
    circular: false, //默认slwiper不可以循环滚动
    myFavorite: 0, //默认收藏按钮是0
    isHasShiti: true //默认有试题

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '我的收藏'
    }) //设置标题
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username; //用户姓名
    let Loginrandom = user.Login_random;
    let zcode = user.zcode;
    let kid = options.kid; //题库编号
    let px = 1;
    let circular = false;
    let myFavorite = 0;

    console.log("action=GetFavoriteShiti&kid=" + kid + "&Loginrandom=" + Loginrandom + "&zcode=" + zcode)
    app.post(API_URL, "action=GetFavoriteShiti&kid=" + kid + "&Loginrandom=" + Loginrandom + "&zcode=" + zcode, false, true, "", "", true, self).then((res) => {
      post.markOnload(options, px, circular, myFavorite, res, user, self)
      isFold = false;
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.hideLoading();
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    //获得dialog组件
    this.markAnswer = this.selectComponent("#markAnswer");
    this.errorRecovery = this.selectComponent("#errorRecovery");
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight
        })
      }
    });
  },

  /**
   * 切换问题的动画
   */
  _toogleAnimation: function() {
    let self = this;

    let px = self.data.px; //当前px
    let str = "#q" + px; //当前问题组件id
    let question = self.selectComponent(str); //当前问题组件

    let lastSliderIndex = self.data.lastSliderIndex; //当前滑块index
    let shitiArray = self.data.shitiArray; //当前试题数组
    let sliderShitiArray = self.data.sliderShitiArray; //当前滑块试题数组
    let shiti = shitiArray[px - 1]; //当前试题
    let height = self.data.height;
    let sliderShiti = sliderShitiArray[lastSliderIndex]; //当前滑块试题

    if (!shiti.confirm && !shiti.isAnswer) return;

    if (isFold) {
      question.setData({
        style2: "positon: fixed; left: 20rpx;height:" + height + "rpx"
      })
      // animate.questionSpreadAnimation(90, height, question);
      animate.blockSpreadAnimation(90, height, question);
      isFold = false;
    } else {
      question.setData({
        style2: "positon: fixed; left: 20rpx;height:90rpx"
      })
      // animate.questionFoldAnimation(height, 90, question);
      animate.blockFoldAnimation(height, 90, question);
      isFold = true;
    }
  },

  /**
   * slider改变事件
   */
  sliderChange: function(e) {
    let self = this;
    let lastSliderIndex = self.data.lastSliderIndex;
    let current = e.detail.current;
    let source = e.detail.source;
    let myFavorite = 0;

    if (source != "touch") return;

    let px = self.data.px;
    let direction = "";
    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let circular = self.data.circular;

    isFold = false;

    //判断滑动方向
    if ((lastSliderIndex == 0 && current == 1) || (lastSliderIndex == 1 && current == 2) || (lastSliderIndex == 2 && current == 0)) { //左滑
      direction = "左滑";
    } else {
      direction = "右滑";
    }

    if (direction == "左滑") {
      px++;
    } else {
      px--;
    }

    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题
    myFavorite = midShiti.favorite;

    //每次滑动结束后初始化前一题和后一题
    if (direction == "左滑") {
      if (px < shitiArray.length) { //如果还有下一题
        nextShiti = shitiArray[px];
        common.initShiti(nextShiti); //初始化试题对象

        //先处理是否是已经回答的题    
        common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
      }
      preShiti = shitiArray[px - 2]; //肯定会有上一题
    } else { //右滑
      if (px > 1) { //如果还有上一题
        preShiti = shitiArray[px - 2];
        common.initShiti(preShiti); //初始化试题对象
        common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      }
      nextShiti = shitiArray[px];
    }

    //滑动结束后,更新滑动试题数组
    let sliderShitiArray = [];

    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;

      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      })
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      })
    }

    circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({ //每滑动一下,更新试题
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      circular: circular,
      myFavorite: myFavorite,
      xiaotiCurrent: 0, //没滑动一道题都将材料题小题的滑动框index置为0
      lastSliderIndex: current,
      px: px,
      checked: false
    })


    //如果是材料题就判断是否动画
    if (midShiti.TX == 99) {
      let str = "#q" + px;

      let questionStr = midShiti.question; //问题的str
      let height = common.getQuestionHeight(questionStr); //根据问题长度，计算应该多高显示

      height = height >= 400 ? 400 : height;

      let question = self.selectComponent(str);

      animate.blockSpreadAnimation(90, height, question);

      question.setData({ //每切换到材料题就把占位框复位
        style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"   
      })

      self.setData({
        height: height
      })
    }
  },

  /**
   * 问答题作答
   */
  wendaSelect: function(e) {
    let self = this;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];
    let user = self.data.user;
    let shiti = shitiArray[px - 1]; //本试题对象

    currentShiti.isAnswer = true;
    shiti.isAnswer = true;

    this.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })

    common.storeAnswerArray(shiti, self) //存储已答题数组

    common.setWendaMarkAnswer(shiti, self) //更新答题板状态

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
  },

  /**
   * 作答
   */
  _answerSelect: function(e) {
    let self = this;
    let px = self.data.px;
    let done_daan = "";
    let shitiArray = self.data.shitiArray; //所有试题对象
    let user = self.data.user;
    let Loginrandom = user.Login_random;
    let zcode = user.zcode;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1]; //本试题对象

    done_daan = shiti.TX == 1 ? e.detail.done_daan : shiti.selectAnswer; //根据单选还是多选得到done_daan

    if (shiti.TX == 2 && shiti.selectAnswer == undefined) {
      wx.showToast({
        title: '还没有作答 !',
        icon: 'none',
      })
      return;
    }

    if (shiti.isAnswer) return;

    common.changeSelectStatus(done_daan, shiti, false); //改变试题状态
    common.changeSelectStatus(done_daan, currentShiti, false); //改变试题状态

    this.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })

    common.changeNum(shiti.flag, self); //更新答题的正确和错误数量

    common.postAnswerToServer(Loginrandom, zcode, shiti.id, shiti.flag, shiti.done_daan, app, API_URL); //向服务器提交答题结果

    common.storeAnswerArray(shiti, self) //存储已答题数组

    common.setMarkAnswer(shiti, self.data.isModelReal, self.data.isSubmit, self) //更新答题板状态

    common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
  },

  /**
   * 多选题选一个选项
   */
  _checkVal: function(e) {
    let self = this;
    let done_daan = e.detail.done_daan.sort();
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex //当前滑动编号
    let currentShiti = sliderShitiArray[current];

    let shiti = shitiArray[px - 1];

    //初始化多选的checked值
    common.initMultiSelectChecked(currentShiti);
    //遍历这个答案，根据答案设置shiti的checked属性

    done_daan = common.changeShitiChecked(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, currentShiti);
    common.changeMultiShiti(done_daan, shiti);
    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },

  /**
   * 材料题点击开始作答按钮
   */
  CLZuoti: function(e) {
    let self = this;

    let str = "#q" + self.data.px;
    let question = self.selectComponent(str);

    let px = self.data.px;
    let lastSliderIndex = self.data.lastSliderIndex;
    let shitiArray = self.data.shitiArray;
    let sliderShitiArray = self.data.sliderShitiArray;
    let shiti = shitiArray[px - 1];
    let height = self.data.height;

    let sliderShiti = sliderShitiArray[lastSliderIndex];
    shiti.confirm = true;
    sliderShiti.confirm = true;

    question.setData({
      style2: "positon: fixed; left: 20rpx;height:90rpx", //问题框"   
    })
    animate.blockFoldAnimation(height, 90, question);
    isFold = true;

    self.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray
    })
  },

  /**
  * 材料题作答
  */
  CLwendaSelect: function (e) {
    let self = this;
    let px = e.currentTarget.dataset.px;

    let shitiPX = self.data.px;//试题的px
    let shitiArray = self.data.shitiArray
    let shiti = shitiArray[shitiPX - 1]; //本试题对象

    let xiaoti = shiti.xiaoti;

    let sliderShitiArray = self.data.sliderShitiArray;
    let current = self.data.lastSliderIndex//当前滑动编号
    let currentShiti = sliderShitiArray[current];

    xiaoti[px - 1].isAnswer = true;

    let allDone = true;

    for (let i = 0; i < xiaoti.length; i++) {

      if (xiaoti[i].isAnswer == undefined || xiaoti[i].isAnswer == false) {
        allDone = false;
      }
    }

    console.log(allDone)
    if (allDone) {
      common.storeAnswerArray(shiti, self) //存储已答题数组
      common.setWendaMarkAnswer(shiti, self) //更新答题板状态
      common.ifDoneAll(shitiArray, self.data.doneAnswerArray); //判断是不是所有题已经做完
    }

    this.setData({
      sliderShitiArray: sliderShitiArray,
      shitiArray: shitiArray
    })
  },

  /**
   * 刚载入时的动画
   */
  onShow: function() {
    let self = this;

    common.markRestart(self); //重新开始作答
  },

  /**
   * 切换纠错面板
   */
  _toggleErrorRecovery: function(e) {
    this.markAnswer.hideDialog();
    this.errorRecovery.toogleDialog();
  },

  /**
   * 切换答题板
   */
  _toogleMarkAnswer: function() {
    this.errorRecovery.hideDialog();
    this.markAnswer.toogleDialog();
  },
  /**
   * 显示答题板
   */
  showMarkAnswer: function() {
    this.markAnswer.showDialog();
  },
  /**
   * 隐藏答题板
   */
  _hideMarkAnswer: function() {
    this.markAnswer.hideDialog();
  },
  /**
   * 切换是否收藏该试题
   */
  _toogleMark: function(e) {
    let self = this;
    let username = self.data.username;
    let acode = self.data.acode;
    let myFavorite = self.data.myFavorite;

    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];

    shiti.favorite = shiti.favorite == 0 ? 1 : 0;
    this.setData({
      myFavorite: shiti.favorite,
      shitiArray: shitiArray
    })
    app.post(API_URL, "action=FavoriteShiti&tid=" + shiti.id + "&username=" + username + "&acode=" + acode, false, true, "").then((res) => {})
  },
  /**
   * 答题板点击编号事件,设置当前题号为点击的题号
   */
  _tapEvent: function(e) {
    let self = this;
    let px = e.detail.px;

    let shitiArray = self.data.shitiArray;
    let doneAnswerArray = self.data.doneAnswerArray;
    let current = self.data.lastSliderIndex; //当前swiper的index
    let circular = self.data.circular;
    let myFavorite = 0;

    //得到swiper数组
    let preShiti = undefined; //前一题
    let nextShiti = undefined; //后一题
    let midShiti = shitiArray[px - 1]; //中间题
    myFavorite = midShiti.favorite;

    isFold = false;

    let sliderShitiArray = [];

    common.initShiti(midShiti); //初始化试题对象
    common.processDoneAnswer(midShiti.done_daan, midShiti, self);

    if (px != 1 && px != shitiArray.length) { //如果不是第一题也是不是最后一题
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti); //初始化试题对象
      common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti); //初始化试题对象
      common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else if (px == 1) { //如果是第一题
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti); //初始化试题对象
      common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);
    } else {
      preShiti = shitiArray[px - 2];
      common.initShiti(preShiti); //初始化试题对象
      common.processDoneAnswer(preShiti.done_daan, preShiti, self);
    }

    //点击结束后,更新滑动试题数组
    if (px != 1 && px != shitiArray.length) {
      if (current == 1) {
        if (nextShiti != undefined) sliderShitiArray[2] = nextShiti;
        sliderShitiArray[1] = midShiti;
        if (preShiti != undefined) sliderShitiArray[0] = preShiti;
      } else if (current == 2) {
        if (nextShiti != undefined) sliderShitiArray[0] = nextShiti;
        sliderShitiArray[2] = midShiti;
        if (preShiti != undefined) sliderShitiArray[1] = preShiti;

      } else {
        if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
        sliderShitiArray[0] = midShiti;
        if (preShiti != undefined) sliderShitiArray[2] = preShiti;
      }
    } else if (px == 1) {
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
      current = 0;
      self.setData({
        myCurrent: 0
      })
    } else if (px == shitiArray.length) {
      sliderShitiArray[0] = preShiti;
      sliderShitiArray[1] = midShiti;
      current = 1;
      self.setData({
        myCurrent: 1
      })
    }

    circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动

    self.setData({
      shitiArray: shitiArray,
      sliderShitiArray: sliderShitiArray,
      px: px,
      circular: circular,
      myFavorite: myFavorite,
      xiaotiCurrent: 0, //没滑动一道题都将材料题小题的滑动框index置为0
      lastSliderIndex: current,
      checked: false
    })
    self._hideMarkAnswer();

    let foldData = undefined; //动画

    //如果是材料题就判断是否动画
    if (midShiti.TX == 99) {
      let str = "#q" + px;
      let questionStr = midShiti.question; //问题的str
      let height = common.getQuestionHeight(questionStr); //根据问题长度，计算应该多高显示

      height = height >= 400 ? 400 : height;

      let question = self.selectComponent(str);

      animate.blockSpreadAnimation(90, height, question); //占位框动画

      question.setData({
        style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"
      })

      self.setData({
        height: height
      })
    }
  },

  /**
   * 纠错提交后
   */
  _submit: function(e) {
    let self = this;

    let user = wx.getStorageSync('user');
    let LoginRandom = user.Login_random;
    let zcode = user.zcode;
    let reason = e.detail.reason;
    let px = self.data.px;
    let shitiArray = self.data.shitiArray;
    let shiti = shitiArray[px - 1];
    let stid = shiti.id

    app.post(API_URL, "action=JiuCuo&LoginRandom=" + LoginRandom + "&zcode=" + zcode + "&stid=" + stid + "&reason=" + reason, true, false, "提交中").then((res) => {
      self.errorRecovery.hideDialog();
    })
  }

})