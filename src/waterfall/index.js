var Magix = require('atom/magix/index')
Magix.applyStyle('global@index.less')

var $body = $('body');

function getHtml(num, end, error, loading){
    var htmlArr = ['<div class="waterfall-list">'];
    for(var i = 0;i < num;i++){
        htmlArr.push('<div class="waterfall-column"></div>');
    }
    htmlArr.push('<div class="waterfall-footer" style="clear:both;"><div class="waterfall-status-done js-hide">' + end + '</div><div class="waterfall-status-loading">' + loading + '</div><div class="waterfall-status-error js-hide">' + error + '</div></div>');
    return htmlArr.join('');
}
module.exports = Magix.View.extend({
    ctor: function(op){
        var me = this;
        me.config = $.extend({
            // target
            // cb
            // render
            distance : 200,
            waterfallCol: 2,
            endHtml: '亲，没有更多了',
            errorHtml: '系统繁忙，请刷新看看~',
            loadingHtml: '<p><span class="loading-icon"></span><span class="loading-text">加载中</span></p>'
        },op);
    },
    render: function(){
        this.target = this.config.target;
        this.waterfallCol = this.config.waterfallCol;
        this.render = this.config.render;
        this.page = 1;
        this.hasLoaded = true;
        this._init();
    },
    _init: function(){
        var me = this;
        me.screenHeight = window.screen.height;
        me.curIndex = 0;
        me.needWaterFall = false;
        $(getHtml(me.waterfallCol,me.config.endHtml,me.config.errorHtml,me.config.loadingHtml)).appendTo(me.target);
        me.loading = me.target.find('.waterfall-status-loading');
        me.end = me.target.find('.waterfall-status-done');
        me.error = me.target.find('.waterfall-status-error');
        me.$waterfallList = me.target.find('.waterfall-column');
        me.waterfallListWidth = me.target.offset().width/me.waterfallCol;
        me.$waterfallList.css('width',me.waterfallListWidth);
        function dealWithScroll(){
            if(!me.needWaterFall){
                return;
            }
            var offset = me.target.offset();
            if(offset.top + offset.height - window.scrollY - me.screenHeight < me.config.distance){
                // 传一个回调出去 让别人调用
                me.load();
                me.end.addClass('js-hide');
                me.error.addClass('js-hide');
                me.loading.removeClass('js-hide');
            }
        }
        window.addEventListener('scroll',dealWithScroll)
        window.addEventListener('resize',function(){
            me.screenHeight = window.screen.height;
        })
        me.load();
    },
    offWaterFall : function(){
        var me = this;
        me.needWaterFall = false;
        setTimeout(function(){
            me.loading.addClass('js-hide');
            me.error.addClass('js-hide');
            me.end.removeClass('js-hide');
        },0)
    },
    errWaterFall : function(){
        var me = this;
        me.needWaterFall = false;
        setTimeout(function(){
            me.loading.addClass('js-hide');
            me.end.addClass('js-hide');
            me.error.removeClass('js-hide');
        },0)
    },
    load: function(){
        var me = this;
        if(!me.hasLoaded){
            return;
        }
        me.hasLoaded = false;
        $body.trigger('wartfallload',{
            load: function(data){
                me.loadData(data);
            },
            page: me.page
        });
        me.page++;
    },
    addIndex: function(){
        var me = this;
        if(me.curIndex + 1 >= me.waterfallCol){
            me.curIndex = 0;
        }else{
            me.curIndex = me.curIndex + 1;
        }
    },
    loadData: function(data){
        var me = this;
        for(var i = 0,j = data.length;i < j;i++){
            var html = me.render(data[i]);
            $(html).appendTo($(me.$waterfallList[me.curIndex]));
            me.addIndex();
        }
        me.hasLoaded = true;
        me.needWaterFall = true;
        me.loading.addClass('js-hide');
    },
    getWidth: function(){
        return this.waterfallListWidth;
    },
    restart: function(){
        this.$waterfallList.html('');
        this.page = 1;
        this.hasLoaded = true;
        this.curIndex = 0;
        this.needWaterFall = false;
        this.load();
        this.loading.removeClass('js-hide');
        this.end.addClass('js-hide');
        this.error.addClass('js-hide');
    },
    clear: function(){
        this.$waterfallList.html('');
        this.page = 1;
        this.hasLoaded = true;
        this.curIndex = 0;
        this.needWaterFall = false;
        this.loading.addClass('js-hide');
        this.end.addClass('js-hide');
        this.error.addClass('js-hide');
    }
}, {
  create: function(options) {
    var id = 'atom' + Magix.guid('waterfall_')
    var rootId = Magix.config('rootId')
    var root = Magix.Vframe.get(rootId)

    $('body').append('<div class="atom-waterfall-wrap" id="' + id + '"/>')
    root.mountVframe(id, '@moduleId', options)

    return $('#' + id)
  }
});
