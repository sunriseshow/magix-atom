var Magix = require('atom/magix/index')
var Dialog = require('src/dialog/index')

// 作为页面的main函数啥的，比如在这里统一加上fastclick
module.exports = Magix.View.extend({
  ctor: function(extra) {
    var me = this

  },
  render: function() {
    var me = this
    me.endUpdate()
    var dialog = Dialog.create({
      content: "我是对话框的内容哈"
    })
    me.dialog = dialog
    me.dialogVf = this.dialog.prop('vframe')

  },
  "showDialog<click>": function(){
    this.dialogVf.invoke('open')
  }
})
