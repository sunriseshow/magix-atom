/**
 * 对话框
 *
 * @author weikang.zhuwk@alibaba-inc.com
 *
 * @param {string} [title] 标题默认为空 ''
 * @param {boolean} [show] 是否直接显示 false
 * @param {string} [view] 是否使用子view ''
 * @param {string} [viewOptions] 子view的配置参数
 * @param {string} [content] 内容 ''
 * @param {boolean} [preventScroll] 是否阻止背景滚动 true
 * @param {string} [closable] 是否显示右上角的关闭按钮 true
 * @param {string} [closeDestroy] 关闭弹框是不是自动销毁 false
 * @param {string} [maskClosable] 是否点击蒙层关闭 true
 * @param {boolean} [animated] 是否启用动画 true
 * @param {string} [elCls] 根节点class名 ''
 * @param {num} [zIndex] z-index的值
 * @param {string} [width] 弹框的宽度 '80%'
 * @param {string} [height] 弹框的高度 auto
 *
 * @event {string} [close] 关闭弹框事件
 * @event {string} [open] 打开弹框事件
 *
 * @method [open] 打开弹框
 * @method [close] 关闭弹框
 *
 * @static create 以一个初始化配置创建一个对话框
 * @static alert 以一个初始化配置创建一个警告
 * @static confirm 以一个初始化配置创建一个确认框
 *
 */
var Magix = require('atom/magix/index')
var Mask = require('atom/mask/index')

var $ = require('atom/zepto/index')
Magix.applyStyle('global@index.less')

module.exports = Magix.View.extend({
  tmpl: '@index.html',
  ctor: function(options) {
    var me = this

    me.$options = $.extend({
      width: '80%',
      height: 'auto',
      closable: true,
      closeDestroy: false,
      maskClosable: true,
      elCls: '',
      view: '',
      viewOptions: {},
      content: '',
      show: false,
      animated: true,
      title: '',
      zIndex: 999,
      preventScroll: true
    }, options)

    me.fixOptions(me.$options)

    me.$maskVf = Mask.create().prop('vframe')
    me.$relatedElement = $('#' + me.id)

    me.on('destroy', function() {
      $('#' + me.id).remove()
      me.$maskVf.invoke('destroy')
    })
  },
  // 属性的特殊处理，比如width这种px的处理
  fixOptions: function(options) {
    if (options.width && /\d$/.test(options.width)) {
      options.width += 'px'
    }
    if (options.height && /\d$/.test(options.height)) {
      options.height += 'px'
    }
  },
  render: function() {
    var me = this
    me.$options.ownerid = me.id

    var html = $.tmpl(me.tmpl, me.$options)
    me.setHTML(me.id, html)

    if (me.$options.view) {
      var vf = Magix.Vframe.get('dialog_subview_of_' + me.id)
      if (vf) {
        vf.mountView(me.$options.view, me.$options.viewOptions)
      }
    }
    // 一些特殊配置的处理
    me.$relatedElement.css('zIndex', me.$options.zIndex)
    if (me.$options.show) {
      me.open()
    }
    if (me.$options.maskClosable) {
      me.$relatedElement.on('click', function(e) {
        if (!$.contains(me.$relatedElement[0], e.target)) {
          me.close()
          me.$maskVf.invoke('hide')
        }

      })
    }
  },
  open: function() {
    var me = this
    me.$maskVf.invoke('show')
    me.$relatedElement.addClass('atom-dialog-show')
    if (me.$options.preventScroll) {
      $('html').addClass('atom-dialog-hide')
    }
    $('#' + this.id).trigger({
      type: 'open',
      value: ''
    })
  },
  close: function() {
    var me = this

    if (me.$options.preventScroll) {
      $('html').removeClass('atom-dialog-hide')
    }

    if (me.$options.closeDestroy) {
      me.destroy()
    }else{
      me.$maskVf.invoke('hide')
      me.$relatedElement.removeClass('atom-dialog-show')
    }

    $('#' + this.id).trigger({
      type: 'close',
      value: ''
    })
  },
  'close<click>': function(e) {
    var me = this
    me.close()
  },
  destroy: function() {
    this.owner.unmountVframe()
  }
}, {
  create: function(options) {
    var id = 'atom' + Magix.guid('dlg_')
    var rootId = Magix.config('rootId')
    var root = Magix.Vframe.get(rootId)

    $('body').append('<div class="atom-dialog-wrap" id="' + id + '"/>')
    root.mountVframe(id, '@moduleId', options)

    return $('#' + id)
  }
})
