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
      $('#aton-mask_' + me.id).remove()
    })
  },
  render: function() {
    var me = this
    var elCls = me.$options.elCls || '' // 赋值给根节点的样式
    var show = me.$options.show || false // 是否初始化就展现
    var id = me.id
    var showClass = show ? 'atom-mask-show' : ''

    $('body').append('<div id="atom-mask_' + id + '" class="atom-mask ' + showClass + elCls + '" />')
    me.$relatedElement = $('#atom-mask_' + id)
    me.endUpdate()
  },
  show: function(){
    this.$relatedElement.addClass('atom-mask-show')
  },
  hide: function(){
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
    $('body').append('<div style="display:none;" id="' + id + '"/>');
    // 返回view对象
    return Magix.Vframe.root().mountVframe(id, '@moduleId', {
      show: true
    }).$v
    // return new this({
    //   // owner:,
    //   id:
    // },options)
  }
})
