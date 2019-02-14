
var th, bh, h, sh, code, http,FNScanner,navObj1,navObj2;
var Findex = Findex2 = bin = myReload = true;
var music = 'none'; //提示声音用
var SOHPtime = [0, 0]; //营业时间
apiready = function() {
    api.parseTapmode();
    code = ls.getItem('code');
    http = api.loadSecureValue({
        sync: true,
        key: 'http'
    });
    FNScanner = api.require('FNScanner');
    if (api.systemType == 'ios') {
        var cla = $('[data-ios]').attr('data-ios');
        $('[data-ios]').addClass(cla);
    }
    //回到前台触发请求接单接口
    api.addEventListener({
        name: 'resume'
    }, function(ret, err) {
        FNScanner.onResume();
        myReload = true;
        api.execScript({
            frameName: 'item0',
            script: 'tapAjax(code, type, 1);'
        });
    });
    //进入后台
    api.addEventListener({
        name: 'pause'
    }, function(ret, err) {
        FNScanner.onPause();
        myReload = false;
    });
    setTimeout(function() {
        api.execScript({
            name: 'login_win',
            frameName: 'login_frm',
            script: 'pwd_none();close_layer();'
        });
    }, 500)

    myfn.fixStatusBar($('.system-h').get(0));
    th = $('.header').height();
    bh = $('.footer').height();
    sh = $('.system-h').height();
    h = $(window).height() - th - bh;
    navObj1 = new NavObj('.subnav', true);
    navObj2 = new NavObj('.subnav2', false);

    api.addEventListener({
        name: 'keyback'
    }, function(ret, err) {
        api.closeWidget({
            id: api.appId,
            retData: {
                name: 'closeWidget'
            },
            animation: {
                type: 'flip',
                subType: 'from_bottom',
                duration: 500
            }
        });
    });
    setTimeout(function() {
        navObj1.open();
        setTimeout(function() {
            myplay();
            SPIfn();
        }, 1000);
    }, 0);
    setInterval(SPIfn, 10000);
};
//扫码功能区

function sao(){
    FNScanner.openScanner({
      autorotation: true
    }, function(ret, err) {
      if (ret) {
          if(ret.eventType=='success'){
            var n = ret.content;
            api.openWin({
                name: 'saoma_win',
                url: './saoma_win.html',
                pageParam: {
                    num: n
                }
            });
          }
          //alert(JSON.stringify(ret));
      } else {
          alert(JSON.stringify(err));
      }
    });
}

//隐藏通用函数
var fnAll = {
    hideAll:function (name){
        for(var i in this.list){
            if(name==i){
                this.list[i](false);
            }else{
                this.list[i](true);
            }
        }
    },
    list:{
        item:function(blo){
            api.setFrameGroupAttr({
                name: 'item',
                hidden: blo
            });
        },
        yichang:function(blo){
            api.setFrameGroupAttr({
                name: 'yichang',
                hidden: blo
            });
        },
        user_frm:function(blo){
            api.setFrameAttr({
                name: 'user_frm',
                hidden:blo
            });
        }
    }
}

// ///////////////////////////////////end////////////////////////////////////////////////

// 导航头纵向切换
function navsubMove(num) {
    $('.move-box').css({
        '-webkit-transform': 'translate3d(0, ' + num + ', 0)',
        'transform': 'translate3d(0, ' + num + ', 0)',
    })
}

// 底部导航切换
function tab(node) {
    if ($(node).hasClass('active')) {
        return false;
    }
    var indexs = $(node).index();
    $(node).addClass('active').siblings('li').removeClass('active');
    if (indexs == '0') {
        navsubMove(0);
        fnAll.hideAll('item');
    } else if (indexs == '1') {
        navsubMove('-0.36rem');
        if (Findex) {
            navObj2.open();
            Findex = false
        } else {
            fnAll.hideAll('yichang');
        }
    } else if (indexs == '2') {
        if (Findex2) {
            api.openFrame({
                name: 'user_frm',
                url: './user_frm.html',
                rect: {
                    x: 0,
                    y: sh,
                    w: 'auto',
                    h: $(window).height() - sh - bh
                },
                bounces: true,
                bgColor: '#fff'
            });
        } else {
            fnAll.hideAll('user_frm');
        }

    }
}

// 接单跳转打印
function couMoveHome(index) {
    navObj1.taps(index);
}

function couMoveHome2(index) {
    navObj2.taps(index);
}
// 打开搜索
function open_search() {
    api.openWin({
        name: 'search_win',
        url: 'search/search_win.html',
        pageParam: {
            name: 'test'
        }
    });
}
// 导航头两个切换菜单的构造函数
function NavObj(node, coco) {
    this.node = node;
    this.coco = coco;
    this.sm = 0;
    this.arr = [];
    this.name = $(this.node).attr('data-name');
    for (var i = 0; i < $(this.node + ' .trans li').length; i++) {
        this.sm += $(this.node + ' .trans li').eq(i).width();
        this.arr.push({
            name: this.name + i,
            url: this.name + '/' + this.name + i + '.html',
            bgColor: '#eff3f9',
            pageParam: {
                title: $(this.node + ' .trans li').eq(i).attr('data-bot')
            }
        })
    }
    new Swiper($(this.node + ' .swiper-top'), {
        direction: 'horizontal',
        loop: false,
        freeMode: true,
        slidesPerView: 'auto',
        touchMoveStopPropagation: false,
        preventLinksPropagation: false,
        preventClicks: false,
        longSwipesRatio: 0.3,
        touchRatio: 1,
    });
}
NavObj.prototype = {
    constructor : NavObj,
    myMove : function(index) {
        $(this.node + ' .trans li').eq(index).addClass('h-active').siblings('li').removeClass('h-active');
        var boxw = $(this.node).width();
        var left = $(this.node + ' .trans li').eq(index).position().left;
        var nowW = ($(this.node + ' .trans li').eq(index).width()) / 2;
        if (left + nowW > boxw / 2) {
            if (this.sm - left - nowW > boxw / 2) {
                this.tapmove(boxw / 2 - (left + nowW));
            } else {
                this.tapmove(boxw - this.sm);
            }
        } else {
            this.tapmove(0)
        }
    },
    tapmove : function(px) {
        $(this.node + ' .trans').css({
            'transform': 'translate3d( ' + px + 'px, 0px, 0px)',
            'transition-duration': '0.3s'
        });
    },
    taps : function(nodes) {
        var index = null;
        if (typeof nodes == 'number') {
            index = nodes;
        } else {
            index = $(nodes).index();
        }
        api.setFrameGroupIndex({
            name: this.name,
            scroll: false,
            index: index
        });
        this.myMove(index);
    },
    open : function() {
        var that = this;
        api.openFrameGroup({
            name: this.name,
            preload: this.arr.length - 1,
            rect: {
                x: 0,
                y: th,
                w: 'auto',
                h: h
            },
            frames: this.arr
        }, function(ret, err) {
            that.myMove(ret.index);
            setTimeout(function() {
                api.execScript({
                    frameName: that.name + ret.index,
                    script: 'firstOne();'
                });
            }, 50)

        });
    }

}

//接单声音提示
function myplay() {
    if (bin) {
        api.startPlay({
            path: 'widget://res/' + music + '.mp3'
        }, function(ret, err) {
            if (ret) {
                api.ajax({
                    url: http + '/informOrder',
                    method: 'post',
                    data: {
                        values: {
                            token: code
                        }
                    }
                }, function(ret, err) {
                    if (ret.message == "true") {
                        music = 'scs';
                        if (myReload) {
                            api.execScript({
                                name: 'home_win',
                                frameName: 'item0',
                                script: 'tapAjax(code, type, 1);'
                            });
                        }
                    } else {
                        music = 'none';
                    }
                });
                myplay();
            } else {
                alert(JSON.stringify(err));
            }
        });
    } else {
        api.stopPlay();
    }
}

//轮询检测是否有新的异常订单
function SPIfn() {
    api.ajax({
        url: http + '/getInfoMessage',
        method: 'post',
        data: {
            values: {
                token: code
            }
        }
    }, function(ret, err) {
        if (ret) {
            if (ret.code == 200) {
                if (ret.data > 0) {
                    $('.SPI').html(ret.data).show();
                } else {
                    $('.SPI').html(ret.data).hide();
                }
            } else {
                open_layer(ret.message, 1500);
            }
        } else {
            //open_layer('服务器错误', 1500);
        }
    });
}
