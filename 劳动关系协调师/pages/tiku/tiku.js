/**
 * 时间 : 2018/10/11 20:33
 * 
 * 说明 : 该页是首页
 * 
 */
const API_URL = 'https://xcx2.chinaplat.com/'; //接口地址
const app = getApp(); //获取app对象
let validate = require('../../common/validate.js');
let buttonClicked = false;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0, //用于题库的index编号,可以得到是第几个题库
    folder_object: [], //展开字节的对象,用于判断点击的章之前有多少个字节被展开
    loaded: false, //是否已经载入一次,用于答题时点击返回按钮,首页再次展现后更新做题数目
    zhangjie: "", //章节信息
    z_id: 0,//题库id
    isLoaded: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;

    let user = wx.getStorageSync('user');

    this.setWindowWidthHeightScrollHeight(); //获取窗口高度 宽度 并计算章节滚动条的高度

    app.post(API_URL, "action=SelectZj").then((res) => {
      this.setZhangjie(res.data.list); //得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index

      app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id, true, true, "请稍后").then((res) => { //得到上一步设置的题库下的所有章节
        let zhangjie = res.data.list //得到所有章节
        let answer_nums_array = [] //答题数目array
        this.initZhangjie(zhangjie, answer_nums_array) //初始化章节信息,构造对应章节已答数目的对象，包括：1.展开初始高度 2.展开初始动画是true 3.答题数等

        // wx.clearStorage(self.data.zhangjie_id)
        // 得到存储答题状态
        wx.getStorage({
          key: 'user',
          success: function (res) {
            let user = res.data;
            wx.getStorage({
              key: "shiti" + self.data.zhangjie_id + user.username,
              success: function (res) {
                //将每个节的已经作答的本地存储映射到组件中    
                for (let i = 0; i < zhangjie.length; i++) {
                  let zhang_answer_num = 0; //章的总作答数
                  if (zhangjie[i].zhangjie_child == undefined) { //如果只有章，没有节
                    zhang_answer_num = res.data[i].length;
                  } else {
                    for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
                      zhangjie[i].zhangjie_child[j].answer_nums = res.data[i][j].length;
                      zhang_answer_num += res.data[i][j].length;
                      if (zhangjie[i].zhangjie_child[j].answer_nums == zhangjie[i].zhangjie_child[j].nums) {
                        zhangjie[i].zhangjie_child[j].isAnswerAll = true;
                      } else {
                        zhangjie[i].isAnswerAll = false;
                      }
                    }
                  }
                  zhangjie[i].zhang_answer_num = zhang_answer_num;
                  if (zhangjie[i].zhang_answer_num == zhangjie[i].nums) { //设置章节是否已经回答完毕
                    zhangjie[i].isAnswerAll = true;
                  } else {
                    zhangjie[i].isAnswerAll = false;
                  }
                }

                //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
                self.setData({
                  zhangjie: zhangjie
                })
              },
              fail: function () { //如果没有本地存储就初始化
                wx.setStorage({
                  key: "shiti" + self.data.zhangjie_id + user.username,
                  data: answer_nums_array
                })
              }
            })
          },

          fail: function () {
            //将每个节的已经作答的本地存储映射到组件中          
            for (let i = 0; i < zhangjie.length; i++) {
              let zhang_answer_num = 0; //章的总作答数
              if (zhangjie[i].zhangjie_child.length == 0) { //如果只有章，没有节
                zhang_answer_num = 0;
              } else {
                for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
                  zhangjie[i].zhangjie_child[j].answer_nums = 0; //节已经回答数
                  zhangjie[i].zhangjie_child[j].isAnswerAll = false;
                }
              }
              zhangjie[i].zhang_answer_num = zhang_answer_num;
              zhangjie[i].isAnswerAll = false;
            }
            //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
            self.setData({
              zhangjie: zhangjie
            })
          }

        })


        self.setData({
          zhangjie: zhangjie,
          // z_id:res.data.list[0].z_id,
          loaded: true, //已经载入完毕
          isLoaded: true,
        })
      })

    })

    if (user) {
      //得到消息数目
      let LoginRandom = user.Login_random;
      let zcode = user.zcode;

      let url = encodeURIComponent('/pages/index/index');
      self.setData({
        isLoaded: false
      })
      app.post(API_URL, "action=GetNoticesNums&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "", url).then((res) => {
        let nums = res.data.nums;

        if (nums > 0) {
          nums = nums.toString();
          wx.setTabBarBadge({
            index: 3,
            text: nums,
          })
        } else {
          wx.setTabBarBadge({
            index: 3,
            text: "",
          })
        }
      })
    }
  },
  /* 更改题库 */
  bindPickerChange: function (e) {
    var self = this
    self.foldAll();
    self.setData({
      index: e.detail.value, //设置是第几个题库
      zhangjie_id: self.data.array[e.detail.value].id, //设置章节的id编号
      folder_object: [], //初始化展开字节的对象,因为更换章节后默认都是不展开状态
      scroll: 0,//初始化章节的滑动条
      isLoaded: false,
    })

    app.post(API_URL, "action=SelectZj_l&z_id=" + self.data.zhangjie_id, false, false, "").then((res) => {
      let answer_nums_array = [] //答题数目array

      let zhangjie = res.data.list; //该题库的所有章节
      for (let i = 0; i < zhangjie.length; i++) {
        zhangjie[i].height = 0; //设置点击展开初始高度
        zhangjie[i].isFolder = true; //设置展开初始值为已经折叠状态
        zhangjie[i].display = false; //设置是否开始动画
        zhangjie[i].zhang_answer_num = 0; //初始化答题数为0
        answer_nums_array[i] = []; //初始化本地存储

        let child = zhangjie[i].zhangjie_child;
        if (child.length > 0) {
          zhangjie[i].hasChild = true;
          for (let j = 0; j < child.length; j++) {
            answer_nums_array[i][j] = []; //初始化本地存储
            zhangjie[i].zhangjie_child[j].answer_nums = 0;
          }
        } else {
          zhangjie[i].hasChild = false;
        }
      }
      self.setData({
        zhangjie: zhangjie,
        isLoaded: true,
      })

      // 得到存储答题状态
      wx.getStorage({
        key: 'user',
        success: function (res) {
          let user = res.data;
          wx.getStorage({
            key: "shiti" + self.data.zhangjie_id + user.username,
            success: function (res) {
              //将每个节的已经作答的本地存储映射到组件中          
              for (let i = 0; i < zhangjie.length; i++) {
                let zhang_answer_num = 0; //章的总作答数
                if (zhangjie[i].zhangjie_child.length == 0) { //如果只有章，没有节
                  zhang_answer_num = res.data[i].length;
                } else {
                  for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
                    zhangjie[i].zhangjie_child[j].answer_nums = res.data[i][j].length;
                    zhang_answer_num += res.data[i][j].length;
                  }
                }
                zhangjie[i].zhang_answer_num = zhang_answer_num;
              }
              //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
              self.setData({
                zhangjie: zhangjie
              })
            },
            fail: function () { //如果没有本地存储就初始化
              wx.setStorage({
                key: "shiti" + self.data.zhangjie_id + user.username,
                data: answer_nums_array
              })
            }
          })

          wx.setStorageSync("tiku_id" + user.username, {
            "id": self.data.array[e.detail.value].id,
            "index": self.data.index
          });
        },
      })
    })

  },
  /**
   * 当点击章节
   */
  onTapZhangjie: function (e) {
    //判断点击展开后 字节的高度+
    let self = this;
    let index = e.currentTarget.dataset.itemidx; //选择章节的index
    let zhangjie = self.data.zhangjie; //取得章节对象

    let hasChild = zhangjie[index].hasChild //是否有子节
    let windowWidth = self.data.windowWidth;
    let num = zhangjie[index].zhangjie_child.length //取得有多少个章节


    if (!hasChild) {
      this.GOzuoti(e);
      return
    }

    //开始动画
    this.step(index, num, windowWidth, zhangjie);

    self.setData({
      zhangjie: zhangjie,
    })
  },
  /**
   * 关闭所有展开
   */
  foldAll: function () {
    let self = this;
    let windowWidth = self.data.windowWidth;
    let zhangjie = self.data.zhangjie //取得章节对象
    for (let i = 0; i < zhangjie.length; i++) {
      let isFolder = zhangjie[i].isFolder; //取得现在是什么状态
      let jie_num = zhangjie[i].zhangjie_child.length;

      let height = (68 + 2 * 750 / windowWidth) * jie_num;

      let scroll = 0;

      if (!isFolder) {
        let foldAnimation = wx.createAnimation({
          duration: 500,
          delay: 0,
          timingFunction: "ease-out"
        })

        foldAnimation.height(0, height + "rpx").opacity(0).step({})

        zhangjie[i].height = 0;
        zhangjie[i].isFolder = true;
        zhangjie[i].folderData = foldAnimation.export();
        self.setData({
          zhangjie: zhangjie,
          scroll: scroll,
        })
      }
    }
  },

  /**
   * 实现展开折叠效果
   */
  step: function (index, num, windowWidth, zhangjie) {
    let self = this;
    let isFolder = zhangjie[index].isFolder; //取得现在是什么状态
    let folder_object = self.data.folder_object //取得展开章节的对象
    let jie_num = 0;

    for (let i = 0; i < folder_object.length; i++) {
      if (folder_object[i].index < index) { //如果在点击选项前面有展开字节
        jie_num += folder_object[i].num //有几个节点就加几个节点
      }
    }

    let height = (68 + 2 * 750 / windowWidth) * num; //上下边框2px 转化为rpx

    let scroll = (index * 80 + jie_num * (68 + 2 * 750 / windowWidth)) * (windowWidth / 750);


    if (isFolder) { //展开
      let spreadAnimation = wx.createAnimation({
        duration: 500,
        delay: 0,
        timingFunction: "ease-in"
      })

      spreadAnimation.height(height + "rpx", 0).opacity(1).step({

      })
      zhangjie[index].isFolder = false;
      zhangjie[index].height = height;
      zhangjie[index].spreadData = spreadAnimation.export()
      //添加对象到折叠数组
      folder_object.push({
        index: index,
        num: num
      })

      self.setData({
        zhangjie: zhangjie,
        scroll: scroll,
        folder_object: folder_object
      })

    } else { //折叠
      zhangjie[index].display = true;

      self.setData({
        zhangjie: zhangjie
      })

      let foldAnimation = wx.createAnimation({
        duration: 500,
        delay: 0,
        timingFunction: "ease-out"
      })

      foldAnimation.height(0, height + "rpx").opacity(0).step(function () { })
      //把折叠对象从折叠对象数组中去除
      for (let i = 0; i < folder_object.length; i++) {
        if (folder_object[i].index == index) {
          folder_object.splice(i, 1)
        }
      }
      zhangjie[index].height = 0;
      zhangjie[index].isFolder = true;
      zhangjie[index].folderData = foldAnimation.export();

      setTimeout(function () {
        zhangjie[index].display = false;
        self.setData({
          zhangjie: zhangjie,
        })
      }, 500)

      self.setData({
        zhangjie: zhangjie,
        folder_object: folder_object
      })
    }
  },

  /**
   * 做题 
   */
  GOzuoti: function (e) {
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;
    let z_id = e.currentTarget.id;
    let zhangIdx = e.currentTarget.dataset.itemidx; //点击的章index
    let jieIdx = e.currentTarget.dataset.jieidx; //点击的节index

    let zhangjie = self.data.zhangjie; //章节
    let zhangjie_id = self.data.zhangjie_id; //当前题库的id，用来作为本地存储的key值
    let title = "";
    if (jieIdx == undefined) {
      title = zhangjie[zhangIdx].title;
      title = title.replace(/第\S{0,2}章\s*(\S+)/g, "$1"); //把第几章字样去掉
    } else {
      title = zhangjie[zhangIdx].zhangjie_child[jieIdx].title
      title = title.replace(/第\S{0,2}节\s*(\S+)/g, "$1"); //把第几节字样去掉
    }

    //如果章节没有字节,将章节总题数置为做题数
    let nums = 0;
    if (zhangjie[zhangIdx].zhangjie_child.length != 0) {
      nums = zhangjie[zhangIdx].zhangjie_child[jieIdx].nums;
    } else {
      nums = zhangjie[zhangIdx].nums;
    }

    let url = encodeURIComponent('/pages/tiku/zuoti/zuoti?z_id=' + z_id + '&nums=' + nums + '&zhangjie_id=' + zhangjie_id + '&zhangIdx=' + zhangIdx + '&jieIdx=' + jieIdx + "&title=" + title);
    let url1 = '/pages/tiku/zuoti/zuoti?z_id=' + z_id + '&nums=' + nums + '&zhangjie_id=' + zhangjie_id + '&zhangIdx=' + zhangIdx + '&jieIdx=' + jieIdx + "&title=" + title
    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd

        //验证重复登录:  参数:1.url1  没转码的url  2.url 转码的url 3.true 代码验证如果是重复登录是否跳转到要导向的页面
        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true) //验证重复登录
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 导航到我的错题页面
   */
  GOAnswerWrong: function (e) {
    this.waterWave.containerTap(e);
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;
    let kid = self.data.zhangjie_id;
    let url = encodeURIComponent('/pages/tiku/wrong/wrong?kid=' + kid)
    let url1 = '/pages/tiku/wrong/wrong?kid=' + kid;
    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd
        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true)
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 导航到收藏练习
   */
  GOMarkExercise: function (e) {
    this.waterWave.containerTap(e);
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;
    let kid = self.data.zhangjie_id;
    let url = encodeURIComponent('/pages/tiku/mark/mark?kid=' + kid)
    let url1 = '/pages/tiku/mark/mark?kid=' + kid;
    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd
        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true)
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 导航到模拟考试
   */
  GOkaoqianmiji: function (e) {
    this.waterWave.containerTap(e);
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;
    let kid = self.data.zhangjie_id;
    let url = encodeURIComponent('/pages/tiku/kaoqianmiji/kaoqianmiji')
    let url1 = '/pages/tiku/kaoqianmiji/kaoqianmiji';

    //获取是否有登录权限
    wx.getStorage({
      key: 'user',
      success: function (res) { //如果已经登陆过
        let user = res.data;
        let zcode = user.zcode;
        let LoginRandom = user.Login_random;
        let pwd = user.pwd
        validate.validateDPLLoginOrPwdChange(zcode, LoginRandom, pwd, url1, url, true)
      },
      fail: function (res) { //如果没有username就跳转到登录界面
        wx.navigateTo({
          url: '/pages/login1/login1?url=' + url + "&ifGoPage=true",
        })
      }
    })
  },

  /**
   * 导航到模拟真题
   */
  GOModelReal: function (e) {
    this.waterWave.containerTap(e);
    if (buttonClicked) return;
    buttonClicked = true;
    let self = this;
    let ti = e.currentTarget.dataset.ti; //题型(押题,真题)

    let kid = self.data.zhangjie_id;
    let url1 = '/pages/tiku/modelReal/modelRealList/modelRealList?kid=' + kid + "&ti=" + ti;

    wx.navigateTo({
      url: url1
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.waterWave = this.selectComponent("#waterWave");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    buttonClicked = false;
    let zhangjie = self.data.zhangjie;

    if (!self.data.loaded) return //如果没有完成首次载入就什么都不作

    // 得到存储答题状态
    wx.getStorage({
      key: 'user',
      success: function (res) {
        let user = res.data;

        //得到消息数目
        let LoginRandom = user.Login_random;
        let zcode = user.zcode;

        let url = encodeURIComponent('/pages/index/index');
        app.post(API_URL, "action=GetNoticesNums&LoginRandom=" + LoginRandom + "&zcode=" + zcode, false, true, "", url).then((res) => {
          let nums = res.data.nums;

          if (nums > 0) {
            nums = nums.toString();
            wx.setTabBarBadge({
              index: 3,
              text: nums,
            })
          } else {
            wx.setTabBarBadge({
              index: 3,
              text: "",
            })
          }
        })

        wx.getStorage({
          key: "shiti" + self.data.zhangjie_id + user.username,
          success: function (res) {

            //将每个节的已经作答的本地存储映射到组件中          
            for (let i = 0; i < zhangjie.length; i++) {
              let zhang_answer_num = 0; //章的总作答数
              if (zhangjie[i].zhangjie_child.length == 0) { //如果只有章，没有节
                zhang_answer_num = res.data[i].length;
              } else {
                for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
                  zhangjie[i].zhangjie_child[j].answer_nums = res.data[i][j].length;
                  zhang_answer_num += res.data[i][j].length;
                  if (zhangjie[i].zhangjie_child[j].answer_nums == zhangjie[i].zhangjie_child[j].nums) {
                    zhangjie[i].zhangjie_child[j].isAnswerAll = true;
                  } else {
                    zhangjie[i].zhangjie_child[j].isAnswerAll = false;
                  }
                }
              }
              zhangjie[i].zhang_answer_num = zhang_answer_num;
              if (zhangjie[i].zhang_answer_num == zhangjie[i].nums) { //设置章节是否已经回答完毕
                zhangjie[i].isAnswerAll = true;
              } else {
                zhangjie[i].isAnswerAll = false;
              }
            }
            //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
            self.setData({
              zhangjie: zhangjie
            })
          },

          fail: function () {
            //将每个节的已经作答的本地存储映射到组件中          
            for (let i = 0; i < zhangjie.length; i++) {
              let zhang_answer_num = 0; //章的总作答数
              if (zhangjie[i].zhangjie_child.length == 0) { //如果只有章，没有节
                zhang_answer_num = 0;
              } else {
                for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
                  zhangjie[i].zhangjie_child[j].answer_nums = 0; //节已经回答数
                  zhangjie[i].zhangjie_child[j].isAnswerAll = false;
                }
              }
              zhangjie[i].zhang_answer_num = zhang_answer_num;
              zhangjie[i].isAnswerAll = false;
            }

            let answer_nums_array = [] //答题数目array
            for (let i = 0; i < zhangjie.length; i++) {
              zhangjie[i].zhang_answer_num = 0; //初始化答题数
              let child = zhangjie[i].zhangjie_child; //字节
              answer_nums_array[i] = []; //初始化本地存储

              if (child.length > 0) {
                zhangjie[i].hasChild = true;
                for (let j = 0; j < child.length; j++) {
                  answer_nums_array[i][j] = []; //初始化本地存储
                  zhangjie[i].zhangjie_child[j].answer_nums = 0; //初始化节的已作答数目
                }
              } else {
                zhangjie[i].hasChild = false;
              }
            }

            wx.setStorage({
              key: "shiti" + self.data.zhangjie_id + user.username,
              data: answer_nums_array
            })
            //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
            self.setData({
              zhangjie: zhangjie
            })
          }
        })
      },

      fail: function (res) {
        //将每个节的已经作答的本地存储映射到组件中          
        for (let i = 0; i < zhangjie.length; i++) {
          let zhang_answer_num = 0; //章的总作答数
          if (zhangjie[i].zhangjie_child.length == 0) { //如果只有章，没有节
            zhang_answer_num = 0;
          } else {
            for (let j = 0; j < zhangjie[i].zhangjie_child.length; j++) {
              zhangjie[i].zhangjie_child[j].answer_nums = 0; //节已经回答数
              zhangjie[i].zhangjie_child[j].isAnswerAll = false;
            }
          }
          zhangjie[i].zhang_answer_num = zhang_answer_num;
          zhangjie[i].isAnswerAll = false;
        }
        //因为是在同步内部，最后需要更新章节信息，不更新数据不会改变
        self.setData({
          zhangjie: zhangjie
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取窗口高度 宽度 并计算章节滚动条的高度
   */
  setWindowWidthHeightScrollHeight: function () {
    let windowWidth = wx.getSystemInfoSync().windowWidth; //获取窗口宽度(px)
    let windowHeight = wx.getSystemInfoSync().windowHeight; //获取窗口高度(px)
    windowHeight = (windowHeight * (750 / windowWidth)); //转换窗口高度(rpx)
    let scrollHeight = windowHeight - 675 //计算滚动框高度(rpx) 

    this.setData({
      windowWidth: windowWidth, //窗口宽度
      windowHeight: windowHeight, //窗口可视高度
      scrollHeight: scrollHeight, //滚动条高度
    })
  },

  /**
   * 得到当前题库的缓存,并设置变量:1.所有题库数组 2.要显示的题库id 3.要显示的题库index
   */
  setZhangjie: function (res) {
    let z_id = 0;
    let index = 0;
    let tiku = wx.getStorageSync("tiku_id");
    if (tiku == "") {
      z_id = res[0].id;
      index = 0;
    } else {
      z_id = tiku.id;
      index = tiku.index;
    }

    this.setData({
      array: res,
      zhangjie_id: z_id,
      index: index
    })
  },

  /**
   * 初始化章节信息
   */
  initZhangjie: function (zhangjie, answer_nums_array) { //初始化章节信息,构造对应章节已答数目的对象，包括：1.展开初始高度 2.展开初始动画是true 3.答题数等
    for (let i = 0; i < zhangjie.length; i++) {
      zhangjie[i].height = 0; //设置点击展开初始高度
      zhangjie[i].isFolder = true; //设置展开初始值
      zhangjie[i].display = false; //设置是否开始动画
      zhangjie[i].zhang_answer_num = 0; //初始化答题数
      let child = zhangjie[i].zhangjie_child; //字节

      answer_nums_array[i] = []; //初始化本地存储

      if (child.length > 0) {
        zhangjie[i].hasChild = true;
        for (let j = 0; j < child.length; j++) {
          answer_nums_array[i][j] = []; //初始化本地存储
          zhangjie[i].zhangjie_child[j].answer_nums = 0; //初始化节的已作答数目
        }
      } else {
        zhangjie[i].hasChild = false;
      }
    }
  }
})