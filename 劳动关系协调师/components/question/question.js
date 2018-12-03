// components/question/question.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    num_color: {
      type: String,
      value: ""
    },
    px: {
      type: Number,
      value: 1,
    },
    isModelReal: {
      type: Boolean,
      value: false
    },

    tx: {
      type: String,
      value: "",
      observer: function(tx) {
        let style1 = "";
        let style2 = "";
        let style3 = "";
 
        if (tx == "材料题") {
          style1: "display:block;margin-bottom:30rpx;height:90rpx"
          style3 = "position:fixed;z-index:10000";
        } else {
          style1 = "display:none;"; //占位框
          style3 = "position:block";
        }
        this.setData({
          style1: style1,
          style2: style2,
          style3: style3
        })
      }
    },
    question: {
      type: String,
      value: ""
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  pageLifetimes: {
    show: function() {
      let tx = this.data.tx;
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {

    toogleShow: function() {
      if (this.data.tx != "材料题") return;
      this.triggerEvent('toogleAnimation')
    },
  }
})