// components/waterWave/waterWave.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    containerTap: function (res) {
      let x = res.touches[0].pageX;
      let y = res.touches[0].pageY + 85;
      this.setData({
        rippleStyle: 'top:' + y + 'px;left:' + x + 'px;-webkit-animation: ripple 0.4s linear;animation:ripple 0.4s linear;'
      });
      setTimeout(()=>{
        this.setData({
          rippleStyle:""
        })
      },400)
    }
  }
})
