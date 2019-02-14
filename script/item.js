var http; //加密的端口号
var code; //存储的用户唯一标示
var page = 1; //获取数据库页数标识
var stop = true; //控制异常的标识，没啥蛋用
var title;
var timer;
var tb = true; //限制请求的标识
var tb2 = true; //限制请求营业时间标识
Vue.filter('time', function(value) {
    return format(value)
});
Vue.filter('money', function(value) {
    return (value / 100).toFixed(2)
});
Vue.filter('abs', function(value) {
    return Math.abs(value);
});
// Vue.filter('abs', function(value) {
//     var num = parseInt(value);
//     var str = value.slice(-1);
//     return Math.abs(num) + str;
// });
// Vue.filter('newTime', function(value) {
//     return value >= 60 || value <= -60 ? parseInt(value / 60) + 'm' : value + 's'
// });

var vm = new Vue({
    el: '#vm',
    data: {
        totalQuantity: 0,
        item: [],
        order: {}, //打印用
        orderItemList: [], //打印用
        homeSayId: 0, //打印用
        packageInfoList: [], //打印用
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
    methods: {
        open_courier: function(node, blo) {
            var index = $(node).attr('data-index');
            var orderId = this.item[index].id;
            api.openFrame({
                name: 'courier_win',
                url: 'widget://html/layer/courier_win.html',
                pageParam: {
                    stop: blo,
                    orderId: orderId
                },
                animation: {
                    type: "movein", //动画类型（详见动画类型常量）
                    subType: "from_top", //动画子类型（详见动画子类型常量）
                    duration: 200 //动画过渡时间，默认300毫秒
                },
                bgColor: 'rgba(0,0,0,0.5)'
            });
        },
        open_beizhu: function(node) {
            var index = $(node).attr('data-index');
            var orderId = this.item[index].id;
            var str = '';
            if (type == 0) {
                var placeholder = '请输入取消原因';
            } else if (type == 3) {
                var placeholder = '请输入提货码';
            }
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
                    id: orderId,
                    value: str,
                    name: 'item' + type,
                    btnyes: '发送',
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
        },
        qx_wuliu: function(node, blo) {
            var index = $(node).attr('data-index');
            var orderId = vm.item[index].id;
            var distributionType = 1; //vm.item[index].distributionType
            api.openFrame({
                name: 'courier_win',
                url: 'widget://html/layer/courier_win.html',
                pageParam: {
                    stop: blo,
                    orderId: orderId,
                    distributionType: distributionType
                },
                animation: {
                    type: "movein", //动画类型（详见动画类型常量）
                    subType: "from_top", //动画子类型（详见动画子类型常量）
                    duration: 200 //动画过渡时间，默认300毫秒
                },
                bgColor: 'rgba(0,0,0,0.5)'
            });
        },
        shopDis: function(node) {
            var index = $(node).attr('data-index');
            var orderId = vm.item[index].id;
            api.confirm({
                title: '',
                msg: '确定开始配送吗',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                var index = ret.buttonIndex;
                if (index == 1) {
                    changeState('item', 4, orderId, 4, 'couMoveHome');
                }
            });
        },
        shopDisEnd: function(node) {
            var index = $(node).attr('data-index');
            var orderId = vm.item[index].id;
            api.confirm({
                title: '',
                msg: '确定完成配送吗',
                buttons: ['确定', '取消']
            }, function(ret, err) {
                var index = ret.buttonIndex;
                if (index == 1) {
                    changeState('item', 5, orderId, 5, 'couMoveHome');
                }
            });
        },
        inUser: function(node,n) {
            var index = $(node).attr('data-index');
            var orderId = this.item[index].id;
            var str = n==1?'确定通知用户提货吗':'确定再次通知用户提货吗';
            api.confirm({
                title: '',
                msg: str,
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
                            if(n==1){
                                changeState('item', 3, orderId, 3, 'couMoveHome');
                            }else{
                                api.alert({title: '提醒成功'});
                            }
                        }else{
                            api.alert({msg: ret.message});
                        }
                    } else {
                        alert(JSON.stringify(err));
                    }
                });
            }
        },
        homeSay: function(node) {
            var systemType = api.systemType;
            if (systemType == 'ios') {
                api.alert({
                    title: '提示',
                    msg: 'ios系统暂不支持打印',
                });
                return false;
            }
            open_layerImg(10000);
            var index = $(node).attr('data-index');
            var orderId = this.homeSayId = this.item[index].id;
            api.ajax({
                url: http + '/orderDetail',
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
                    if (ret.code == '200') {
                        vm.orderItemList = ret.data.orderItemList;
                        vm.order = ret.data.order;
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
                        setTimeout(function() {
                            api.execScript({
                                name: 'login_win',
                                script: 'sayHello("home_win","item1");'
                            });
                        }, 0)
                    } else {
                        open_layer(ret.message, 1500);
                    }

                } else {
                    open_layer('连接服务器失败', 1500);
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    code = ls.getItem('code');
    http = api.loadSecureValue({
        sync: true,
        key: 'http'
    });
    if(api.systemType == 'ios'){
        vm.systemType = true
    }
    api.setRefreshHeaderInfo({
        loadingImg: 'widget://image/refresh.png',
        bgColor: '#eff3f9',
        textColor: '#999',
        textDown: '下拉刷新...',
        textUp: '松开刷新...'
    }, function(ret, err) {
        tapAjax(code, type, 1, function() {
            api.refreshHeaderLoadDone();
            page = 1;
            stop = true;
            $('.bot-bot').hide();
        });
    });


    if (type == 0 || type == 10) {
        open_layerImg(5000);
        tapAjax(code, type, 1)
    }

    api.addEventListener({
        name: 'scrolltobottom',
        extra: {
            threshold: 0
        }
    }, function(ret, err) {
        if (vm.totalQuantity != 0) {
            if (stop) {
                open_layerImg(100000);
                page++;
                tapAjax(code, type, page);
                stop = false;
            }
        }
    });
};

//更改订单状态函数
function changeState(name, nameNum, orderId, stateNum, fnName) {
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

                    deleteItem(orderId); //删除节点
                    api.execScript({
                        name: 'home_win',
                        frameName: name + nameNum,
                        script: 'tapAjax(code, type, 1);' //需要刷新的页面
                    });
                    api.execScript({
                        name: 'home_win',
                        script: fnName + '(' + nameNum + ')' //需要跳转的页面
                            //script: 'couMoveHome('+nameNum+')' //需要跳转的页面
                    });
                });
            } else {
                open_layer(ret.message, 1500);
            }
        } else {
            close_layerImg();
            open_layer('连接服务器失败', 1500);
        }
    });
}


//判断是否首次加载
function firstOne() {
    if (tb) {
        open_layerImg(5000);
        tapAjax(code, type, 1);
        tb = false;
    }
}


//删除节点操作
function deleteItem(orderId) {
    for (var d = 0; d < vm.item.length; d++) {
        if (vm.item[d].id == orderId) {
            vm.item.splice(d, 1);
            vm.totalQuantity--;
        }
    }
}

// 请求数据
function tapAjax(token, status, currentPage, fn) {
    api.ajax({
        url: http + '/listOrder',
        method: 'post',
        data: {
            values: {
                token: token,
                status: status,
                currentPage: currentPage
            },
        }
    }, function(ret, err) {
        //alert(JSON.stringify(ret))
        if (ret) {
            if (ret.code == '200') {
                if (currentPage > 1) {
                    if (ret.data.length != 0) {
                        vm.item = vm.item.concat(ret.data);
                        vm.$nextTick(function() {
                            api.toast({
                                msg: '加载成功',
                                duration: 800,
                                location: 'bottom'
                            });
                            close_layerImg();
                            setTimeout(function() {
                                stop = true;
                            }, 300)
                        })

                    } else {
                        api.toast({
                            msg: '没有了',
                            duration: 800,
                            location: 'bottom'
                        });
                        close_layerImg();
                        $('.bot-bot').show();
                    }
                } else {
                    page = 1;
                    $('.bot-bot').hide();
                    vm.item = ret.data;
                    vm.totalQuantity = ret.totalQuantity;
                    vm.$nextTick(function() {
                        close_layerImg();
                        setTimeout(function() {
                            stop = true;
                        }, 300);
                    })
                    fn && fn();
                }
                for (var i = 0; i < vm.item.length; i++) {
                    Vue.set(vm.item[i], 'myTimes', (vm.item[i].expectTimeEnd - vm.item[i].currentSystemTime) / 1000);
                }
                setTimeout(function() {
                    api.parseTapmode();
                    //lastTimeFn();
                    $('.vm' + type).show();
                    if (tb2) {
                        shopTimeFn()
                    } else {
                        vm.shopTime.now = nowTime();
                    }

                }, 0)
            } else {
                open_layer('服务器错误', 1500);
                close_layerImg();
                api.refreshHeaderLoadDone();
            }
        } else {
            open_layer('连接服务器失败', 1500);
            close_layerImg();
            api.refreshHeaderLoadDone();
        }
    });
}
// //定时器函数 ---最好不要删除，以后会用到
// function lastTimeFn() {
//     clearInterval(timer);
//     lastTimeFnIf();
//     timer = setInterval(function() {
//         lastTimeFnIf();
//     }, 1000);
// }
//
// //计时流程控制函数---最好不要删除，以后会用到
// function lastTimeFnIf(){
//     if (type == 0 || type == 10) {
//         for (var i = 0; i < vm.item.length; i++) {
//             if (vm.item[i].remainingTime <= 0) {
//                 deleteItem(vm.item[i].id);
//                 api.closeFrame({
//                     name: 'courier_win'
//                 });
//
//             } else {
//                 vm.item[i].remainingTime--;
//             }
//         }
//     } else if (type == 3) {
//         for (var i = 0; i < vm.item.length; i++) {
//             if (vm.item[i].remainingTime >= 0) {
//                 vm.item[i].remainingTime++;
//                 if (vm.item[i].orderMode == 2 && vm.item[i].remainingTime > (120 * 60)) {
//                     vm.item[i].remainingTime = -1;
//                 }
//             } else {
//                 vm.item[i].remainingTime--;
//             }
//         }
//     } else if (type == 4) {
//         for (var i = 0; i < vm.item.length; i++) {
//             vm.item[i].remainingTime++;
//             if (vm.item[i].myTimes > 0) {
//                 vm.item[i].myTimes--;
//             } else {
//                 vm.item[i].myTimes = 0;
//             }
//         }
//     }
// }

//请求营业时间
function nowTime() {
    var time = new Date();
    var h = time.getHours();
    var m = time.getMinutes();
    return '' + h + m;
}

function shopTimeFn() {
    api.ajax({
        url: http + '/getMineInfo',
        method: 'post',
        data: {
            values: {
                token: code
            }
        }
    }, function(ret, err) {
        if (ret) {
            if (ret.code == 200) {
                vm.shopTime.state = ret.data.businessTimeStart.replace(/:/g, '');
                vm.shopTime.end = ret.data.businessTimeEnd.replace(/:/g, '');
                vm.shopTime.now = nowTime();
                tb2 = false;
            } else {
                open_layer(ret.message, 1500);
            }
        }
    });
}

//打开订单详情
function open_order(node) {
    var id = $(node).parents('.item1').attr('data-id');
    var orderMode = $(node).parents('.item1').attr('data-orderMode');
    var time = $(node).parents('.item1').attr('data-time');
    var distributionType = $(node).parents('.item1').attr('data-distributionType');
    api.openWin({
        name: 'order_win',
        url: '../order_win.html',
        pageParam: {
            id: id,
            type: type,
            orderMode: orderMode,
            time: time,
            distributionType: distributionType,
            shopTime: [vm.shopTime.state, vm.shopTime.end]
        }
    });
}

//判断打印是否连接


function goSay(n) {
    if (n) {
        api.execScript({
            name: 'setPrint_win',
            frameName: 'setPrint_frm',
            script: 'addstr(' + JSON.stringify(vm.order) + ',' + JSON.stringify(vm.orderItemList) + ',"item1",' + vm.homeSayId + ',"home_win",' + JSON.stringify(vm.wuliu) + ');'
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
                    script: 'setOpen("home_win");'
                });
            }
        });

    }
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
    return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm);
    //return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}
