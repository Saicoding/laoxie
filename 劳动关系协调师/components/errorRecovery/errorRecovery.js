// components/errorRecovery/errorRecovery.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    windowHeight: {
      type: Number,
      value: 0,
    },
    windowWidth:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    checked: false,
    reason:"",
    content:"",
    options: [
      { 'title': "题目错误",
        'src':"/imgs/error_select1.png"
      },
      {
        'title': "选项错误",
        'src': "/imgs/error_select1.png"
      },
      {
        'title': "答案内容",
        'src': "/imgs/error_select1.png"
      },
      {
        'title': "解析错误",
        'src': "/imgs/error_select1.png"
      },
      {
        'title': "其他错误",
        'src': "/imgs/error_select1.png"
      },
      ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: false
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        isShow: true
      })
    },
    //toogle展示
    toogleDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //阻止事件冒泡
    stopBubbling: function (e) {
    },

    //点击了空地,让蒙版消失
    tapBlank: function (e) {
      this.setData({
        isShow: false
      })
    },

    //输入框事件
    saveContent:function(e){
      let content = e.detail.value;
      this.setData({
        content:content
      })
    },

    //点击选项按钮事件
    errorSelect:function(e){
      let index = e.detail.value;
      let options = this.data.options;
      let reason = options[index].title;
      reason = "【"+reason+"】";
     
      for(let i = 0 ;i<options.length;i++){
        let option = options[i];
        option.src = "/imgs/error_select1.png";
      }

      options[index].src = "/imgs/error_select.png";
      
      this.setData({
        options:options,
        reason:reason
      })
    },

    //提交后
    _submit:function(){
      let reason = this.data.reason;

      if(reason == ""){
        wx.showToast({
          title: '请选择纠错原因',
          icon:'none',
          duration:2000
        })
        return;
      }
      let content = this.data.content;
      reason = reason+content;
      this.triggerEvent("submit", { "reason": reason});
    }
  }
})
