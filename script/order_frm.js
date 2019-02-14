var stop = true;
var clipBoard;
var http;
var code;
var id;
var type;
Vue.filter('time', function(value) {
    return format(value)
});
Vue.filter('money', function(value) {
    return (value / 100).toFixed(2)
});
Vue.filter('danhao', function(value) {
    if (value) {
        return '物流单号:' + value;
    }
});
Vue.filter('str', function(value) {
    if (value == "" || value == null) {
        return "无备注";
    } else {
        return value;
    }
});

var vm = new Vue({
        el: '#vm',
        data: {
            allMoney: 0,
            tuikuan: false,
            order: {},
            orderItemList: [],
            packageInfoList: [],
            wuliu: {
                men: '',
                car: '',
                phone: '',
                num: ''
            }, //打印用
            shopTime: {
                state: 0,
                end: 0,
                now: 0
            },
            systemType:false
        },
        mounted: function() {

        },
        methods: {
            numMove: function(node, blo) {
                if ($(node).hasClass('none')) {
                    return false;
                }
                var index = $(node).attr('data-index');
                var objArr = this.orderItemList;
                if (!blo) {
                    objArr[index].conNum--;
                    if (objArr[index].conNum < 0) {
                        objArr[index].conNum = 0
                    }
                } else {
                    objArr[index].conNum++;
                    if (objArr[index].conNum > objArr[index].conNum2) {
                        objArr[index].conNum = objArr[index].conNum2
                    }
                }
                this.money();
            },
            numNone: function(node) {
                if ($(node).hasClass('none')) {
                    return false;
                }
                var index = $(node).attr('data-index');
                vm.orderItemList[index].ban = !vm.orderItemList[index].ban;
                if (vm.orderItemList[index].ban) {
                    vm.orderItemList[index].conNum = 0;
                } else {
                    vm.orderItemList[index].conNum = vm.orderItemList[index].conNum2;
                }

                this.money();
            },
            money: function() {
                vm.allMoney = 0;
                for (var i = 0; i < vm.orderItemList.length; i++) {
                    vm.allMoney += vm.orderItemList[i].salePrice * vm.orderItemList[i].conNum;
                }
                vm.allMoney = vm.allMoney.toFixed(2)
            },
            open_layerItem:function(node){
                var index = $(node).attr('data-index');
                var data = this.orderItemList[index];
                api.openFrame({
                    name: 'layer_line_item',
                    url: 'widget://html/layer/layer_line_item.html',
                    bgColor:'rgba(0,0,0,0.5)',
                    bounces: true,
                    pageParam: {
                        data: data
                    }
                });
            }
        }
    })
    //请求营业时间
function nowTime() {
    var time = new Date();
    var h = time.getHours();
    var m = time.getMinutes();
    return '' + h + m;
}
apiready = function() {
        open_layerImg(10000);
        clipBoard = api.require('clipBoard');
        if(api.systemType == 'ios'){
            vm.systemType = true
        }
        api.parseTapmode();
        code = ls.getItem('code');
        id = api.pageParam.id;
        type = api.pageParam.type;
        vm.shopTime.state = api.pageParam.shopTime[0];
        vm.shopTime.end = api.pageParam.shopTime[1];
        vm.shopTime.now = nowTime();
        http = api.loadSecureValue({
            sync: true,
            key: 'http'
        });
        api.setRefreshHeaderInfo({
            loadingImg: 'widget://image/refresh.png',
            bgColor: '#eff3f9',
            textColor: '#999',
            textDown: '下拉刷新...',
            textUp: '松开刷新...'
        }, function(ret, err) {
            orderAjax(code, id, function() {
                api.refreshHeaderLoadDone();
            });
        });
        setTimeout(function() {
            orderAjax(code, id);
        }, 50)


    }
    //请求
function orderAjax(token, orderId, fn) {
    api.ajax({
        url: http + '/orderDetail',
        method: 'post',
        data: {
            values: {
                token: token,
                orderId: orderId
            }
        }
    }, function(ret, err) {
        close_layerImg();
        if (ret) {

            if (ret.code == '200') {
                vm.orderItemList = ret.data.orderItemList;

                vm.order = ret.data.order;
                //alert(JSON.stringify(vm.order));
                vm.packageInfoList = ret.data.packageInfoList.reverse();
                for (var i = 0; i < vm.packageInfoList.length; i++) {
                    if (vm.packageInfoList[i].distributionCompany != null && vm.packageInfoList[i].distributionCompany != '') {
                        vm.wuliu.car = vm.packageInfoList[i].distributionCompany;
                    }
                    if (vm.packageInfoList[i].driverName != null && vm.packageInfoList[i].driverName != '') {
                        vm.wuliu.men = vm.packageInfoList[i].driverName;
                    }
                    if (vm.packageInfoList[i].driverPhone != null && vm.packageInfoList[i].driverPhone != '') {
                        vm.wuliu.phone = vm.packageInfoList[i].driverPhone;
                    }
                    if (vm.packageInfoList[i].distributionNumber != null && vm.packageInfoList[i].distributionNumber != '') {
                        vm.wuliu.num = vm.packageInfoList[i].distributionNumber;
                    }
                }
                //alert(JSON.stringify(vm.order))
                for (var k = 0; k < vm.orderItemList.length; k++) {
                    Vue.set(vm.orderItemList[k], 'conNum', vm.orderItemList[k].quantity - vm.orderItemList[k].refundQuantity);
                    Vue.set(vm.orderItemList[k], 'conNum2', vm.orderItemList[k].quantity - vm.orderItemList[k].refundQuantity);
                    Vue.set(vm.orderItemList[k], 'ban', false);
                    if (vm.orderItemList[k].refundQuantity != 0) {
                        vm.tuikuan = true;
                    }
                }

                vm.$nextTick(function() {
                    $('#vm img').on('load', function() {
                        $(this).removeAttr('not');
                    });
                    vm.money();
                })
                setTimeout(function() {

                    api.parseTapmode();
                    $('#vm').show();
                }, 0)
            } else {
                open_layer(ret.message, 1000);
            }

        } else {
            open_layer('连接服务器失败', 1000);
        }
        fn && fn();
    });
}
//物流情况显示隐藏
function wuliu(node) {
    var h = $('.flow-move').height();
    if (stop) {
        $('.flow-box').css({
            'height': h + 'px'
        });
        $(node).html('收起');
        stop = false;
    } else {
        $('.flow-box').css({
            'height': '0px'
        });
        $(node).html('展开');
        stop = true;
    }

}
//打开备注的包装函数
function mybeizhu() {
    var str = $('#mybeizhu').html();
    open_beizhu(vm.order.id, str, 'order_frm', '保存', null);
}
//设置打开备注格式
function open_beizhu(id, value, name, btnyes, placeholder) {
    var str = $('#mybeizhu').html();
    api.openFrame({
        name: 'beizhu',
        url: 'widget://html/layer/beizhu.html',
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        pageParam: {
            id: id,
            value: value,
            name: name,
            btnyes: btnyes,
            placeholder: placeholder
        },
        animation: {
            type: "movein", //动画类型（详见动画类型常量）
            subType: "from_bottom", //动画子类型（详见动画子类型常量）
            duration: 300 //动画过渡时间，默认300毫秒
        },
        bounces: false,
        bgColor: 'rgba(0,0,0,0.5)',
    });
}
//打开弹框页面
function open_courier(blo) {
    api.openFrame({
        name: 'courier_win',
        url: 'widget://html/layer/courier_win.html',
        pageParam: {
            stop: blo,
            orderId: vm.order.id,
            distributionType: 1 //vm.order.distributionType
        },
        animation: {
            type: "movein", //动画类型（详见动画类型常量）
            subType: "from_top", //动画子类型（详见动画子类型常量）
            duration: 200 //动画过渡时间，默认300毫秒
        },
        bgColor: 'rgba(0,0,0,0.5)'
    });
}
//供给其他页面操作本页面备注
function beizhuval(text) {
    $('#mybeizhu').html(text);
}
//打电话函数
function myCall(node) {
    var number = $(node).find('[call]').html();
    api.confirm({
        title: '',
        msg: '确定拨打'+number+'吗',
        buttons: ['确定', '取消']
    }, function(ret, err){
        var index = ret.buttonIndex;
        if(index == 1){
          api.call({
              type: 'tel_prompt',
              number: number
          });
        }
    });
}
//复制函数
function copy(node) {
    var value = $(node).html();
    clipBoard.set({
        value: value
    }, function(ret, err) {
        if (ret) {
            api.alert({
                title: '提示',
                msg: '复制成功'
            });
        } else {
            api.alert({
                title: '提示',
                msg: '复制失败'
            });
        }
    });
}

function add0(m) {
    return m < 10 ? '0' + m : m
}

function format(shijianchuo) {
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date(shijianchuo);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y + '-' + add0(m) + '-' + add0(d) + '  ' + add0(h) + ':' + add0(mm);
    //return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}

function gaidan() {
    var str = $('#gaidan').html();
    var arr = [];
    for (var i = 0; i < vm.orderItemList.length; i++) {
        arr.push({
            orderItemId: vm.orderItemList[i].id,
            quantity: vm.orderItemList[i].conNum2 - vm.orderItemList[i].conNum
        })
    }
    if (str == '修改订单') {
        $('.let').show();
        $('#gaidan').html('保存');
    } else {
        open_layerImg(10000);
        api.ajax({
            url: http + '/createRefund',
            method: 'post',
            data: {
                values: {
                    token: code,
                    orderId: id,
                    data: arr
                }
            }
        }, function(ret, err) {
            if (ret) {

                if (ret.code == '200') {
                    close_layerImg()
                    setTimeout(function() {
                        open_layer('保存成功', 1000);
                        orderAjax(code, id);
                    }, 0);
                    $('.let').hide();
                    $('#gaidan').html('修改订单');
                    // for (var i = 0; i < vm.orderItemList.length; i++) {
                    //     vm.orderItemList[i].refundQuantity += vm.orderItemList[i].conNum2 - vm.orderItemList[i].conNum;
                    // }

                } else {
                    for (var i = 0; i < vm.orderItemList.length; i++) {
                        vm.orderItemList[i].conNum = vm.orderItemList[i].conNum2
                    }
                    close_layerImg();
                    setTimeout(function() {
                        //open_layer(ret.message, 1000);
                        api.alert({
                            title: '',
                            msg: ret.message,
                        });

                    }, 0)
                }
            } else {
                for (var i = 0; i < vm.orderItemList.length; i++) {
                    vm.orderItemList[i].conNum = vm.orderItemList[i].conNum2
                }
                close_layerImg()
                setTimeout(function() {
                    open_layer('保存异常', 1000);
                }, 0)
            }

            vm.$nextTick(function() {
                vm.money();
            })
        });
    }
}
//配货完成，通知用户
function inUser() {
    var orderId = vm.order.id;
    api.confirm({
        title: '',
        msg: '确定通知用户提货吗',
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            zitiAjax();
        }
    });

    function zitiAjax() {
        open_layerImg(10000);
        api.ajax({
            url: http + '/informUser',
            method: 'post',
            data: {
                values: {
                    token: code,
                    orderId: orderId
                }
            }
        }, function(ret, err) {
            close_layerImg();
            if (ret) {
                if (ret.code == 200) {
                    changeState('item', 3, vm.order.id, 3, 'couMoveHome');

                }
            } else {
                alert(JSON.stringify(err));
            }
        });
    }

}

//再次提醒用户提货
function inUser_two(node) {
    var orderId = vm.order.id;
    api.confirm({
        title: '',
        msg: '确定再次通知用户提货吗',
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            zitiAjax2();
        }
    });

    function zitiAjax2() {
        open_layerImg(10000);
        api.ajax({
            url: http + '/informUser',
            method: 'post',
            data: {
                values: {
                    token: code,
                    orderId: orderId
                }
            }
        }, function(ret, err) {
            if (ret) {
                close_layerImg();
                if (ret.code == 200) {
                    api.alert({title: '提醒成功'});
                }
            } else {
                close_layerImg();
                alert(JSON.stringify(err));
            }
        });
    }
}


//异常订单 yichang0的同意请求
function userApply() {
    var id = vm.order.id;
    api.confirm({
        title: '',
        msg: '确认同意取消',
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            api.ajax({
                url: http + '/isAgreeCancelOrder',
                method: 'post',
                data: {
                    values: {
                        token: code,
                        isAgreeCancelOrder: 1,
                        orderId: id
                    }
                }
            }, function(ret, err) {
                if (ret) {
                    if (ret.code == 200) {
                        open_layer('操作成功', 1000);
                    } else {
                        open_layer(ret.message, 1000);
                    }
                } else {
                    open_layer('连接服务器失败', 1000);
                }
            });

        }
    });
}

//店员配送点击函数
function shopDis() {
    var orderId = vm.order.id;
    api.confirm({
        title: '',
        msg: '确定开始配送吗',
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            changeState('item', 4, vm.order.id, 4, 'couMoveHome');

        }
    });
}

//店员配送完成函数

function shopDisEnd() {
    api.confirm({
        title: '',
        msg: '确定完成配送吗',
        buttons: ['确定', '取消']
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index == 1) {
            changeState('item', 5, vm.order.id, 5, 'couMoveHome');

        }
    });
}
//改变订单状态函数
function changeState(name, nameNum, orderId, stateNum, fnName){
    api.ajax({
        url: http + '/updateOrderState',
        method: 'post',
        data: {
            values: {
                token: code,
                orderId: orderId,
                status: stateNum
            }
        }
    }, function(ret, err) {
        if (ret) {
            close_layerImg();
            if (ret.code == 200) {
                api.alert({
                    title: '',
                    msg: ret.message,
                }, function(ret, err) {

                    api.execScript({
                        name: 'home_win',
                        frameName: name + (nameNum-1),
                        script: 'deleteItem(' + orderId + ');' //接单页面节点随之刷新
                    });
                    api.execScript({
                        name: 'home_win',
                        frameName: name + nameNum,
                        script: 'tapAjax(code, type, 1);' //打印页面随之刷新
                    });
                    api.execScript({
                        name: 'home_win',
                        script: fnName + '(' + nameNum + ')' //首页跳转打印
                    });
                    setTimeout(function() {
                        api.closeWin({
                            name: 'order_win'
                        });
                    }, 100)
                });
            }else{

            }
        } else {
            close_layerImg();
            alert(JSON.stringify(err));
        }
    });
}


//触发打印命令
function dayin_frm() {
    open_layerImg(10000);
    api.execScript({
        name: 'setPrint_win',
        frameName: 'setPrint_frm',
        script: 'addstr(' + JSON.stringify(vm.order) + ',' + JSON.stringify(vm.orderItemList) + ',"order_frm",' + vm.order.id + ',"order_win",' + JSON.stringify(vm.wuliu) + ');'
    });
}
