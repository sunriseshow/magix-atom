/**/
var Magix = require('atom/magix/index')
var $ = require('atom/zepto/index')
Magix.applyStyle('global@index.less')

module.exports = Magix.View.extend({
	tmpl: '@index.html',
    render: function() {
        var me = this;
        var op = $('#' + this.id).data('option');
		typeof op === 'string' && (op = $.parseJSON(op));
		me.config = $.extend({
			showtop : 200
		},op||{});
		var showTop = me.config.showtop;
        me.setHTML(me.id,me.tmpl);
        function doScroll (){
            var top = document.body.scrollTop;
            var btn = document.getElementById('mx-atom-goTop');
            if(btn){
                if(top > showTop){
                    btn.style.display = 'block';
                }else{
                    btn.style.display = 'none';
                }
            }
        }
        window.addEventListener('scroll', doScroll);
        doScroll();
    },
    "goTop<click>": function(){
        window.scrollTo(0,-1);
    }
});