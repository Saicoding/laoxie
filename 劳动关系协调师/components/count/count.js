// components/count/count.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    rightNum:{
      type:Number,
      value:0
    },
    wrongNum:{
      type:Number,
      value:0
    },
    px:{
      type:Number,
      value:0
    },
    nums:{
      type:Number,
      value:0
    },
    isMark:{
      type:Number,
      value:0
    } 
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //切换是否收藏的状态
    _toogleMark:function(){
      this.setData({
        isMark:!this.data.isMark
      })
      this.triggerEvent('toogleMark');
    },
    _toggleMarkAnswer:function(){
      this.triggerEvent('toogleMarkAnswer')
    },

    _toggleErrorRecovery:function(){
      this.triggerEvent('toggleErrorRecovery')
    }
  }
})
