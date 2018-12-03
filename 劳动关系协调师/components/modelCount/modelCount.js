// components/modelTestCount/modelTestCount.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    px: {
      type: Number,
      value: 0
    },
    nums: {
      type: Number,
      value: 0
    },
    isMark: {
      type: Number,
      value: 0
    },
    text:{
      type:String,
      value:'立即交卷'
    },
    hidden:{
      type:Boolean,
      value:true
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    timeStr:'开始计时'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //切换是否收藏的状态
    _toogleMark: function () {
      this.setData({
        isMark: !this.data.isMark
      })
      this.triggerEvent('toogleMark');
    },

    _toggleMarkAnswer: function () {
      this.triggerEvent('toogleMarkAnswer')
    },

    _submit:function(){
      let text = this.data.text;
      if(text == "立即交卷"){
        this.triggerEvent('submit');
      }else{
        this.triggerEvent('restart')
      }
      
    }
  }
})
