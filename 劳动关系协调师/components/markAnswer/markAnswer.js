// components/markAnswer/markAnswer.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    windowHeight:{
      type:Number,
      value:0
    },
    isLianxi: {
      type: Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false,
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
 
    //点击编号事件
    _tapEvent(e) {
      let px = e.currentTarget.dataset.px;
      let cl = e.currentTarget.dataset.cl;
      //触发取消回调
      this.triggerEvent("tapEvent",{"px":px,"cl":cl});
    },

    //重新练题
    _restart(){
      this.triggerEvent("restart");
    },

    //阻止事件冒泡
    stopBubbling:function(e){
    },

    //点击了空地,让蒙版消失
    tapBlank: function (e) {
      this.setData({
        isShow: false
      })
    },
  }
})
