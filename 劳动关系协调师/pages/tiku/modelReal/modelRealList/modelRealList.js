// pages/tiku/modelReal/modelRealList/modelRealList.js
const API_URL = 'https://xcx2.chinaplat.com/laoxie/'; //接口地址
const app = getApp(); //获取app对象
let common = require('../../../../common/shiti.js');

let validate = require('../../../../common/validate.js');
let  buttonClicked = false;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isHasShiti: true,//默认有试题
    isLoaded:false// 默认没有载入完毕
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let self = this;
    let user = wx.getStorageSync('user');
    let username = user.username;
    let acode = user.acode;
    let tiType = options.ti == "model"?1:2;//获取题的类型
    let title = options.ti == "model" ?"模拟真题":"考前押题";
    wx.setNavigationBarTitle({
      title: title
    }) //设置标题

    self.setData({
      title: title,
    })

    let px = 1;

    app.post(API_URL, "action=GetTestlist&kid=" + options.kid + "&username=" + username + "&acode=" + acode + "&types=" + tiType, false, true, "","",true,self).then((res) => {
      let modelList = res.data.list;

      for (let i = 0; i < modelList.length; i++) { 
        let model = modelList[i];

        //设置分数字体颜色
        let score = model.test_score;

        model.ifDone = score == 0 ?false:true;

        model.scoreColor = score >= 60 ? "#6dec60" : "#e06740";

        self.setImg(score, model);//根据分数改变图标状态
      }

      self.setData({
        modelList: modelList, //真题列表
        isLoaded: true,
        tiType:tiType//题的类型（押题，真题）
      })
    }).catch((errMsg) => {
      console.log(errMsg); //错误提示信息
      wx.hideLoading();
    });
  },

  GOModelRealDetail: function(e) {
    if(buttonClicked) return;
    buttonClicked = true;
    let self = this;
    if(self.buttonClicked) return;
    let id = e.currentTarget.dataset.id;
    let test_score = e.currentTarget.dataset.test_score;
    let times = e.currentTarget.dataset.times;
    let title = e.currentTarget.dataset.title;
    let totalscore = e.currentTarget.dataset.totalscore;
    let tiType = self.data.tiType;

    let url = encodeURIComponent('/pages/tiku/modelReal/modelRealDetail/modelRealDetail?id=' + id + "&times=" + times + "&title=" + title + "&totalscore=" + totalscore + "&tiType=" + tiType + "&test_score=" + test_score);
    let url1 = '/pages/tiku/modelReal/modelRealDetail/modelRealDetail?id=' + id + "&times=" + times + "&title=" + title + "&totalscore=" + totalscore + "&tiType=" + tiType + "&test_score=" + test_score;


    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd

        //验证重复登录:  参数:1.url1  没转码的url  2.url 转码的url 3.true 代码验证如果是重复登录是否跳转到要导向的页面
        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url,true)
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function (res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowHeight: windowHeight
        })
      }
    });
  },

  /**
 * 根据分数设置图片
 */
  setImg: function (score, model) {
    if (score == 0) {
      model.base64 = "data:image/png;base64,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";
    } else if (score >= 60) {
      model.base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAA3NCSVQICAjb4U/gAAAAnFBMVEX///8W6QAY5wAa5gAN5AAP4QAW4AAU4AAa5gAS5QAW4wAY4QAU4gAY3wAY4wAW4wAY4QAW4AAY3wAY4wQZ4QQW4QQV4QAY3wQY4QIZ4QQX3wIY4QIY3wQY4QIW4QIY3wIX3wIZ4QQY3wQZ4QQY4QIY3wQX3wIZ4QQY3wQZ4QQY3wQZ4QQY3wQZ4QQY3wQY3wIZ4QQY3wQZ4QQY3wT9jwIXAAAANHRSTlMAERERERERESIiIiIiIjMzMzMzRERERERVVVVmZnd3d3eIiJmZmZmqqru7zMzd3d3u7v//Y5+ZdQAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAF7SURBVFiF7ZdfV4JAEMXX1DItQGvDMjLpj7jqBne//3drCnEXBYWlhx64TyPu/ObCOXvOXMa0Bg9+Fd25HVagmVCorG14edA+2lTv/lUyz4+n6fJzxiu9gu9PIzovurp/oqCCovcqlbsGIv1TQj3V6icJYJrVz0C9+T/qxpBZvca2dj9jATBJq75CaAGgtkVajQFuAaAvt0yLe8CxAQis0oJbA0QLaAEtoAW0gH8D2KsFNAAMGgKibC2xBNBW8N4IIKBGTQBkYLdfWAK0ATuAs/8ClgAycN0EYBqwAqyg9L5uAcgZsAHQomwEhvoAMmDutpUAHTPmkIFeTUBHKh1RfGRb8h4wPgfoKsP1BkkudnlGdCgVj83Ll9/uif52FsCcOLs9hwYYWx49KdJwm8YkfpxvuL6Zp3RFBNEjA/HROFEtNPUpXG4ei87eJMS+PU/o0aQEccE/rgRUFJbrYnfwQynMCwCMLU4nZy87F3y9lNgbvgpZDvFKuv5A30G9bdjjKrb2AAAAAElFTkSuQmCC";
    } else if (score < 60) {
      model.base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAA3NCSVQICAjb4U/gAAABF1BMVEXgZj/tqJHicUz32c/20cXojnH539bmhGXwtKH649zrm4Lyvq387unkeljgaELvsp/0ybvnjG7soYnpk3jxuqj31cr65uD98u/ha0b43NPvr5vjdlP0x7jniWrkfl3okHT54dnzxbbtpY7wt6Xqlnz88e31zsH76+XhbUjuq5bgakT99PH54tvyvazidFDrn4fmh2jgZ0DojXD318v65d/plXrjeFbtp5H76eT52dHlfFrni23haED97+n98/D43dXhbknpkXLpknbrnYXick7xvKvvsZ3lgF/77OfxuafwtaPso4vhbEb30cfoj3L3183rmXztpY/jd1Tlfl71z8HplXj98+/53dPvq5f99fPpl3r87+vhb0ujYqGOAAAAXXRSTlP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wD///8SqHTsAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAaRJREFUWIXt19lOwkAUBuAqiKAwiIgCoiiy1o0fcAkkYBAUlyCBq4m+/3M4XQaKWtrO3HjR/2racr6ctimZo9BFRpmAq0QsNVThi1w/DdeZ1Uo/gP0j99V6HoZLQE5V1XZhu+nuFgLBLUJIwwL0CMEr9ZLIJjBZADFgx1M9SxIoc+AUCHutp911PHOgg6nnekr3gJ4JAE8CACUkawAXQFAEOMajAaSAkAjQwdgAgsCJCJBAwgd8wAd8wAf+DWDEB+SAqCQwwaUUwHYFd1JAEqQiA7AGtP2FONA3GhAGQsAulQHyIFEZgDVQoDLAGGpJBmANrFEZYANpPjAIAayBGl8LAQmkz70ChxjO1wEgOz9gQBPIONV32UAV5wd1VBdXGNAyR4eVSb3P3/yHxTK2+6r65gjQ0MD8elgDX5bzGlBE9cBZuJ8CRapv7q3zlQY0ub06pRm0DX4dA+tZfehqQP93ckwdOCoDL7+AzyugP3IhsFGtutyAOXhG2gC5iduHP6NrRVGGfwCUZsnKSbfFfx++XboBy/BdOcvH7JEWtYtie8VlvgGTsPZ2qbL/pAAAAABJRU5ErkJggg==";
    }
  },

  /**
   * 生命周期函数
   */
  onShow:function(){
    let self = this;
    let back = self.data.back;
    buttonClicked = false;

    if (back) {
      let modelList = self.data.modelList;
      for (let i = 0; i < modelList.length; i++) {
        let model = modelList[i];

        //设置分数字体颜色
        let score = model.test_score;

        model.ifDone = score == 0 ? false : true;

        model.scoreColor = score >= 60 ? "#6dec60" : "#e06740";

        self.setImg(score, model);
      }

      self.setData({
        modelList: modelList, //真题列表
      })
    }
  }
})