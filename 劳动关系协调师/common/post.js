let common = require('shiti.js');
let animate = require('animate.js')

/**
 * 练习题
 */
function zuotiOnload(options, px, circular, myFavorite, shitiArray, user, page, all_nums, pageall,self){
  console.log(shitiArray)
  let username = user.username;
  let LoginRandom = user.Login_random;
  let zcode = user.zcode;

  //得到swiper数组
  let preShiti = undefined;//前一题
  let nextShiti = undefined;//后一题

  let midShiti = shitiArray[px - 1];//中间题
  let sliderShitiArray = [];
  let lastSliderIndex = 0;

  common.initShiti(midShiti); //初始化试题对象

  if(px != 1 && px !=shitiArray.length){//如果不是第一题也是不是最后一题
    preShiti = shitiArray[px-2];
    common.initShiti(preShiti); //初始化试题对象
    nextShiti = shitiArray[px];
    common.initShiti(nextShiti); //初始化试题对象
  }else if(px == 1){//如果是第一题
    if (shitiArray.length != 1) {
      nextShiti = shitiArray[px];
      common.initShiti(nextShiti); //初始化试题对象
    }
  }else{
    preShiti = shitiArray[px-2];
    common.initShiti(preShiti); //初始化试题对象
  }

  //对是否是已答试题做处理
  wx.getStorage({
    key: "shiti" + options.zhangjie_id+username,
    success: function (res1) {
      //根据章是否有子节所有已经回答的题
      let doneAnswerArray = res1.data[self.data.zhangIdx][self.data.jieIdx];

      if (options.tid =="5"){
        common.setWendaMarkAnswerItems(doneAnswerArray, self)
      } else if (options.tid =="99"){
        common.setWendaMarkAnswerItems(doneAnswerArray, self)
      }else{
        common.setMarkAnswerItems(doneAnswerArray, options.nums, self.data.isModelReal, self.data.isSubmit, self); //设置答题板数组 
      }
          

      //映射已答题目的已作答的答案到shitiArray
      for (let i = 0; i < doneAnswerArray.length; i++) {
        let doneAnswer = doneAnswerArray[i];
        shitiArray[doneAnswer.px - 1].done_daan = doneAnswer.done_daan;//设置已答试题的答案
        
        if (options.tid == "5"){//如果是问答题就设置已回答
          shitiArray[doneAnswer.px - 1].isAnswer = true;//设置已答试题的答案
        } else if (options.tid == "99"){
          shitiArray[doneAnswer.px - 1].confirm = true;
          for (let j = 0; j < shitiArray[doneAnswer.px - 1].xiaoti.length;j++){
            let xt = shitiArray[doneAnswer.px - 1].xiaoti[j];
            xt.isAnswer = true;
          }
        }
      }
      
      //先处理是否是已经回答的题,渲染3个
      if (preShiti != undefined) common.processDoneAnswer(preShiti.done_daan, preShiti, self);
      common.processDoneAnswer(midShiti.done_daan, midShiti, self);
      if (nextShiti != undefined) common.processDoneAnswer(nextShiti.done_daan, nextShiti, self);

      //根据已答试题库得到正确题数和错误题数
      let rightAndWrongObj = common.setRightWrongNums(doneAnswerArray);

      //如果已答试题数目大于0才更新shiti
      if (doneAnswerArray.length > 0) {
        self.setData({
          sliderShitiArray: sliderShitiArray,
          doneAnswerArray: doneAnswerArray, //获取该节所有的已做题目
          rightNum: rightAndWrongObj.rightNum,
          wrongNum: rightAndWrongObj.wrongNum
        })
      }
    },
  })

  circular = px == 1 || px == shitiArray.length ? false : true //如果滑动后编号是1,或者最后一个就禁止循环滑动
  myFavorite = midShiti.favorite;

  if (px != 1 && px != shitiArray.length) {//如果不是第一题也不是最后一题
    sliderShitiArray[0] = midShiti;
    sliderShitiArray[1] = nextShiti;
    sliderShitiArray[2] = preShiti;
  } else if (px == 1) {//如果是第一题
    if (shitiArray.length !=1){
      sliderShitiArray[0] = midShiti;
      sliderShitiArray[1] = nextShiti;
    }else{
      sliderShitiArray[0] = midShiti;
    }

  } else {//如果是最后一题
    sliderShitiArray[0] = preShiti;
    sliderShitiArray[1] = midShiti;
    lastSliderIndex = 1;
    self.setData({
      myCurrent: 1
    })
  }

  self.setData({
    z_id: options.z_id, //点击组件的id编号
    tid:options.tid,//题型
    zhangjie_id: options.zhangjie_id, //章节的id号，用于本地存储的key
    zhangIdx: options.zhangIdx, //章的id号
    jieIdx: options.jieIdx, //节的id号

    px:px,
    user:user,
    title: options.title,//标题
    circular:circular,
    myFavorite: myFavorite,//是否收藏

    nums: all_nums, //题数
    pageall: pageall,//总页数

    shitiArray: shitiArray, //整节的试题数组
    sliderShitiArray: sliderShitiArray,//滑动数组
    lastSliderIndex: lastSliderIndex,//默认滑动条一开始是0
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
  });

  //如果是材料题就有动画
  if (midShiti.TX == 99) {
    let str = "#q" + px;
    let questionStr = midShiti.question;//问题的str
    let height = common.getQuestionHeight(questionStr);//根据问题长度，计算应该多高显示

    height = height >= 400 ? 400 : height;

    let question = self.selectComponent(str);

    animate.blockSpreadAnimation(90, height, question);//占位框动画

    question.setData({
      style2: "positon: fixed; left: 20rpx;height:" + height + "rpx", //问题框"
    })

    self.setData({
      height: height,
    })
  }
}

/**
 * 收藏题
 */
function markOnload(options, px, circular, myFavorite,res, user, self){
  let shitiArray = res.data.shiti;
  let username = user.username;
  let LoginRandom = user.Login_random;
  let zcode = user.zcode;

  common.initShitiArrayDoneAnswer(shitiArray);//将试题的所有done_daan置空

  common.setMarkedAll(shitiArray);

  common.initMarkAnswer(shitiArray.length, self); //初始化答题板数组

  //得到swiper数组
  let nextShiti = undefined;//后一题
  let midShiti = shitiArray[0];//中间题
  let sliderShitiArray = [];

  common.initShiti(midShiti); //初始化试题对象
  
  if(shitiArray.length !=1){
    nextShiti = shitiArray[1];
    common.initShiti(nextShiti); //初始化试题对象
  }

  circular =  false //如果滑动后编号是1,或者最后一个就禁止循环滑动
  myFavorite = midShiti.favorite;

  if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
  sliderShitiArray[0] = midShiti;

  self.setData({
    //设置过场动画
    winH: wx.getSystemInfoSync().windowHeight,
    opacity: 1,
    px: px,

    nums: shitiArray.length, //题数
    shitiArray: shitiArray, //整节的试题数组
    sliderShitiArray: sliderShitiArray,//滑动数组
    circular: circular,
    myFavorite: myFavorite,//是否收藏
    lastSliderIndex: 0,//默认滑动条一开始是0
    isLoaded: true, //是否已经载入完毕,用于控制过场动画
    user:user
  });
  
  wx.hideLoading();
}


/**
 * 错题
 */

function wrongOnload(options, px, circular, myFavorite, res, user,  requesttime,self) {
  let shitiArray = res.data.shiti;
  let all_nums = res.data.all_nums;
  let pageall = res.data.pageall;
  
  let username = user.username;
  let LoginRandom = user.Login_random;
  let zcode = user.zcode;


  common.initShitiArrayDoneAnswer(shitiArray);//将试题的所有done_daan置空

  common.initMarkAnswer(all_nums, self); //初始化答题板数组

  shitiArray = common.initShitiArray(shitiArray, all_nums,1);
 

  //得到swiper数组
  let nextShiti = undefined;//后一题
  let midShiti = shitiArray[0];//中间题
  let sliderShitiArray = [];

  common.initShiti(midShiti); //初始化试题对象

  if (shitiArray.length != 1) {
    nextShiti = shitiArray[1];
    common.initShiti(nextShiti); //初始化试题对象
  }

  circular = false //如果滑动后编号是1,或者最后一个就禁止循环滑动
  myFavorite = midShiti.favorite;

  if (nextShiti != undefined) sliderShitiArray[1] = nextShiti;
  sliderShitiArray[0] = midShiti;

  console.log(self.data.isLoaded)

  self.setData({
    //设置过场动画
    winH: wx.getSystemInfoSync().windowHeight,
    opacity: 1,
    px: px,
    
    kid:options.kid,//题库编号
    nums: all_nums, //题数
    shitiArray: shitiArray, //整节的试题数组
    sliderShitiArray: sliderShitiArray,//滑动数组
    circular: circular,
    pageall: pageall,//总页数
    pageArray: [1],//当前所有已经渲染的页面数组
    myFavorite: myFavorite,//是否收藏
    lastSliderIndex: 0,//默认滑动条一开始是0
    isLoaded:true, //是否已经载入完毕,用于控制过场动画
    user:user,
    requesttime: requesttime,//第一次请求的时间
  });

  wx.hideLoading();
}

module.exports = {
  zuotiOnload: zuotiOnload,
  wrongOnload: wrongOnload,
  markOnload:markOnload
}
