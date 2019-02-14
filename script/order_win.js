
var fromUrl = 0;
apiready = function() {
        api.parseTapmode();
        myfn.fixStatusBar($('.header').get(0));
        var hh = $('.header').height();
        var fh = $('.footer').height();
        var type = api.pageParam.type;
        var time = api.pageParam.time;
        var distributionType = api.pageParam.distributionType;
        var orderMode = api.pageParam.orderMode;
        $('[orderMode="' + orderMode + '"]').removeAttr('none');
        if (time > 0) {
            $('[time="1"]').removeAttr('none');
        } else {
            $('[time="2"]').removeAttr('none');
        }
        if (distributionType == 3) {
            $('[distributionType="0"]').removeAttr('none');
        } else {
            $('[distributionType="1"]').removeAttr('none');
        }
        $('.box' + type).removeAttr('none');
        api.openFrame({
            name: 'order_frm',
            url: './order_frm.html',
            rect: {
                x: 0,
                y: hh,
                w: 'auto',
                h: api.winHeight - hh - fh
            },
            pageParam: {
                id: api.pageParam.id,
                type: type,
                shopTime: api.pageParam.shopTime
            },
            bounces: true,
            bgColor: '#eff3f9',
            vScrollBarEnabled: false,
            hScrollBarEnabled: false
        });

        api.addEventListener({
            name: 'keyback'
        }, function(ret, err) {
            closeThis();
        });
    }
    //判断打印是否连接
function homeSay() {
    var systemType = api.systemType;
    if (systemType == 'ios') {
        api.alert({
            title: '提示',
            msg: 'ios系统暂不支持打印',
        });
        return false;
    }
    api.execScript({
        name: 'login_win',
        script: 'sayHello("order_win");'
    });
}



function goSay(n) {
    if (n) {
        api.execScript({
            frameName: 'order_frm',
            script: 'dayin_frm();'
        });
    } else {
        api.confirm({
            title: '警告',
            msg: '请先在设置界面连接打印机',
            buttons: ['确定', '取消']
        }, function(ret, err) {
            var index = ret.buttonIndex;
            if (index == 1) {
                api.execScript({
                    name: 'login_win',
                    script: 'setOpen("order_win");'
                });
            }
        });

    }
}

function fromUrlFn() {
    fromUrl = 1;//此参数证明order的上一页面是--打印设置--
}

function closeThis() {
    if (fromUrl) {
        api.openWin({
            name: 'home_win',
            url: './home_win.html',
            animation: {
                type: "push", //动画类型（详见动画类型常量）
                subType: "from_left", //动画子类型（详见动画子类型常量）
                duration: 300 //动画过渡时间，默认300毫秒
            }
        });
        setTimeout(function() {
            api.closeWin();
        }, 500)
    } else {
        api.closeWin();
    }
}
//底部各个模块按钮出发事件
function item0_no() {
    api.execScript({
        frameName: 'order_frm',
        script: 'open_beizhu(vm.order.id,"","item0","发送","请输入取消原因");'
    });
}

function item0_yes() {
    api.execScript({
        frameName: 'order_frm',
        script: 'open_courier(1);'
    });
}

function item2_yes() {
    api.execScript({
        frameName: 'order_frm',
        script: 'open_courier(2);'
    });
}

function item2_yes2() {
    api.execScript({
        frameName: 'order_frm',
        script: 'inUser();'
    });
};

function item3_no() {
    api.execScript({
        frameName: 'order_frm',
        script: 'open_courier(3);'
    });
}

function item3_yes() {
    api.execScript({
        frameName: 'order_frm',
        script: 'open_beizhu(vm.order.id,"","item3","发送","请输入提货码");'
    });
}

function item3_no2() {
    api.execScript({
        frameName: 'order_frm',
        script: 'inUser_two();'
    });
}

function item3_no3() {
    api.execScript({
        frameName: 'order_frm',
        script: 'shopDis();'
    });
}

function item4_yes() {
    api.execScript({
        frameName: 'order_frm',
        script: 'open_beizhu(vm.order.id,"","item4","发送","请输入提货码");'
    });
}

function item4_yes2() {
    api.execScript({
        frameName: 'order_frm',
        script: 'shopDisEnd();'
    });
}


function yichang10_yes() {
    api.execScript({
        frameName: 'order_frm',
        script: 'open_beizhu(vm.order.id,"","yichang0","确定","请输入拒绝理由");'
    });
}

function yichang10_no() {
    api.execScript({
        frameName: 'order_frm',
        script: 'userApply();'
    });
}
