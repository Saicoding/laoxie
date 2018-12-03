// components/multiSelect/multiSelect.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    checked: {
      type: Boolean,
      value: false
    },
    shiti: {
      type: Object,
      value: {}
    },
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
    _checkVal: function (e) {
      let done_daan = e.detail.value;
      this.triggerEvent('checkVal', { 'done_daan': done_daan })
    }
  }
})
