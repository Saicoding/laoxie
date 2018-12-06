//app.js
App({
  /** 
   * 自定义post函数，返回Promise
   * +-------------------
   * author: 武当山道士<912900700@qq.com>
   * +-------------------
   * @param {String}      url 接口网址
   * @param {arrayObject} data 要传的数组对象 例如: {name: '武当山道士', age: 32}
   * +-------------------
   * @return {Promise}    promise 返回promise供后续操作
   */
  post: function(url, data, ifShow,ifCanCancel,title,pageUrl,ifGoPage,self) {

    if (ifShow) {
      wx.showLoading({
        title: title,
        mask: !ifCanCancel
      })
    }

    var promise = new Promise((resolve, reject) => {
      //init
      var that = this;
      var postData = data;
      /*
      //自动添加签名字段到postData，makeSign(obj)是一个自定义的生成签名字符串的函数
      postData.signature = that.makeSign(postData);
      */
      //网络请求

      wx.request({
        url: url,
        data: postData,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) { //服务器返回数据
          let status = res.data.status;
          let message = res.data.message;
          if (status == 1) {//请求成功
            resolve(res);
          } else if(status == -2){//没有权限
            console.log('没有权限')
            wx.navigateTo({
              url: '/pages/pay/pay',
            })
          } else if(status == -5){//重复登录
            console.log('重复登录')
            wx.navigateTo({
              url: '/pages/login1/login1?url=' + pageUrl+'&ifGoPage='+ifGoPage
            })
          } else if (status == -101){//没有试题
            console.log('没有试题')
            self.setData({
              isHasShiti:false,
              isLoaded:true,
              message: message
            })
          }else if(status == -201){
            console.log('余额不足')
            wx.showToast({
              title: '余额不足',
              icon:'none',
              duration:3000
            })
          }else if(status == -1){
            wx.showToast({
              title: message,
              icon: 'none',
              duration: 3000
            })
          }


          wx.hideLoading();
        },
        error: function(e) {
          reject('网络出错');
        }
      })
    });
    return promise;
  },

  onLaunch: function() {
    // wx.clearSt1orage();
    // wx.clearStorage("user")

  },
  globalData: {
  }
})