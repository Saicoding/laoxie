function setColor(category, setSelect, setTitle) {
  switch (category) {
    case "zq":
      wx.setNavigationBarColor({ //设置窗口颜色
        frontColor: "#ffffff",
        backgroundColor: "#fd6131",
      })

      if (setTitle) {
        wx.setNavigationBarTitle({
          title: '证券从业资格',
        })
      } else {
        wx.setNavigationBarTitle({
          title: '金融类从业资格考试通',
        })
      }

      if (setSelect) {
        wx.setTabBarStyle({
          selectedColor: "#fd6131"
        })
      }
      break;
    case "jj":
      wx.setNavigationBarColor({ //设置窗口颜色
        frontColor: "#ffffff",
        backgroundColor: "#ffc722",
      })

      if (setTitle) {
        wx.setNavigationBarTitle({
          title: '基金从业资格',
        })
      } else {
        wx.setNavigationBarTitle({
          title: '金融类从业资格考试通',
        })
      }

      if (setSelect) {
        wx.setTabBarStyle({
          selectedColor: "#ffc722"
        })
      }
      break;
    case "qh":
      wx.setNavigationBarColor({ //设置窗口颜色
        frontColor: "#ffffff",
        backgroundColor: "#C71585",
      })

      if (setTitle) {
        wx.setNavigationBarTitle({
          title: '期货从业资格',
        })
      } else {
        wx.setNavigationBarTitle({
          title: '金融类从业资格考试通',
        })
      }

      if (setSelect) {
        wx.setTabBarStyle({
          selectedColor: "#C71585"
        })
      }
      break;
  }
}

function getColors(category){
  let colors = [];
  switch (category) {
    case "zq":
      colors[0] = "#fd6131";//主颜色
      colors[1] = "#eb3321";//渐变颜色1
      colors[2] = "#fe8c09";//渐变颜色2
      colors[3] = "#B3EE3A";//多选颜色
      colors[4] = "#fea386";//提交答案后上面空白处的颜色
      break;
    case "jj":
      colors[0] = "#ffc722";//主颜色
      colors[1] = "#bc8e03";//渐变颜色1
      colors[2] = "#f6db8a";//渐变颜色2
      colors[3] = "#B3EE3A";//多选颜色
      colors[4] = "#ffdd7f";//提交答案后正确文字的颜色
      break;
    case "qh":
      colors[0] = "#C71585";//主颜色
      colors[1] = "#860356";//渐变颜色1
      colors[2] = "#ef51b4";//渐变颜色2
      colors[3] = "#B3EE3A";//多选颜色
      colors[4] = "#dd77b8";//提交答案后正确文字的颜色
      break;
  }

  return colors;
}

function getColorsRGB(category){
  let colors = [];
  switch (category) {
    case "zq":
      colors[0] = "253, 97, 49";
      break;
    case "jj":
      colors[0] = "255, 199, 34";
      break;
    case "qh":
      colors[0] = "199, 21, 133";
      break;
  }

  return colors;
}

module.exports = {
  setColor: setColor,
  getColors: getColors,
  getColorsRGB: getColorsRGB
}