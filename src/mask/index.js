/*
    author:weikang.zhuwk@alibaba-inc.com
 */
var Magix = require('atom/magix/index')
var $ = require('atom/zepto/index')
Magix.applyStyle('global@index.less');

module.exports = Magix.View.extend({
  //tmpl: '@index.html',
  ctor: function(options) {
    var me = this
    me.$options = options

    me.on('destroy', function() {
      $('#' + me.id).remove()
    })
  },
  render: function() {
    var me = this
    var elCls = me.$options.elCls || '' // 赋值给根节点的样式
    var show = me.$options.show || false // 是否初始化就展现
    var id = me.id

    me.$relatedElement = $('#' + id)
    if (show) {
      me.$relatedElement.addClass('atom-mask-show')
    }

    if (elCls) {
      me.$relatedElement.addClass('atom-mask-show')
    }

    me.endUpdate()
  },
  show: function() {
    this.$relatedElement.addClass('atom-mask-show')
  },
  hide: function() {
    this.$relatedElement.removeClass('atom-mask-show')
  },
  destroy: function() {
    var me = this
      // 会触发destroy事件
    me.owner.unmountVframe()
  }
}, {
  create: function(options) {
    var id = 'atom' + Magix.guid('dlg_');
    var rootId = Magix.config('rootId');
    var root = Magix.Vframe.get(rootId)
    $('body').append('<div class="atom-mask" id="' + id + '"/>');
    root.mountVframe(id, '@moduleId', options)
      // 返回dom对象
    return $('#' + id)
  }
})
