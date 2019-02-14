////////////// 通用弹框 ////////////////////
function open_layer(text, time) {
    api.openFrame({
        name: 'layer_win',
        url: 'widget://html/layer/layer_win.html',
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        pageParam: {
            text: text,
            time: time
        },
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
        animation: {
            type: "fade", //动画类型（详见动画类型常量）
            subType: "from_right", //动画子类型（详见动画子类型常量）
            duration: 200 //动画过渡时间，默认300毫秒
        }
    });
}

function close_layer() {
    setTimeout(function() {
        api.closeFrame({
            name: 'layer_win'
        });
    }, 200)

}

function open_layerImg(time) {
    api.openFrame({
        name: 'layer_img',
        url: 'widget://html/layer/layer_img.html',
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        pageParam: {
            time: time
        },
        bounces: false,
        bgColor: 'rgba(0,0,0,0)',
    });
}

function close_layerImg() {
    api.closeFrame({
        name: 'layer_img'
    });
}
