var Magix = require('atom/magix/index')
var $ = require('atom/zepto/index')

var map_css = {
	transition: 'transition',
	transform: 'transform'
}
if((!"transform" in document.documentElement.style) && ("webkitTransform" in document.documentElement.style)){
	map_css.transition="webkitTransition";
	map_css.transform="webkitTransform";
}

function getXY(dom){
	var xy = {x:0,y:0};
	if(dom = $(dom)){
		var v = dom.css("transform") || dom.css("webkitTransform") || "";
		if(v.indexOf("translate3d") != -1){
			v=v.replace(/.*?translate3d\((.*)\)/,"$1").split(",");
			xy.x=parseFloat(v[0]);
			xy.y=parseFloat(v[1]);
		}
	}
	return xy;
}

function setXY(dom,x,y){
	$(dom).css(map_css.transform,"translate3d("+x+"px,"+y+"px,0px)");
}

function setTransition(dom,t){
	if(map_css.transform == 'webkitTransform'){
		$(dom).css(map_css.transition, "-webkit-transform " + t + "ms ease-out");
	}else{
		$(dom).css(map_css.transition, "transform " + t + "ms ease-out");
	}
}

var getPageX=function(e){
	try{
		return e.changedTouches[0].pageX;
	}catch(err){
		return e.pageX;
	}
};
var getPageY=function(e){
	try{
		return e.changedTouches[0].pageY;
	}catch(err){
		return e.pageY;
	}
};
module.exports = Magix.View.extend({
	ctor: function(op){
		// me.on('destroy', function() {
  		// })
	},
	render : function(){
		var me = this;
		var op = $('#' + this.id).data('option');
		typeof op === 'string' && (op = $.parseJSON(op));
		// me.slideMenu = new slideMenu(op);
		me.config = $.extend({
			// target:,
			maxOffSetDis: 0.4,
			lockX: false,
			lockY: true
		},op);
		me._init();
	},
	_init: function(){
		var me = this;
		me.$parent = $(me.config.target);
		if(!me.$parent){
			return;
		}
		me.$ul = $(me.$parent[0].children[0]);
		function initOffSet(){
			me.$parentOffSet = me.$parent.offset();
			me.$ulOffSet = me.$ul.offset();
			me.maxOffSetX = me.$parentOffSet.width * me.config.maxOffSetDis;
			me.minOffSetX = - me.$ulOffSet.width + me.$parentOffSet.width - me.maxOffSetX;
			me.maxOffSetY = me.$parentOffSet.height * me.config.maxOffSetDis;
			me.minOffSetY = - me.$ulOffSet.height + me.$parentOffSet.height - me.maxOffSetY;
		}
		initOffSet();
		window.addEventListener('resize',function(){
            initOffSet();
			me.bindEvent();
        });
		// set transition
		setTransition(me.$ul,200);
		me.bindEvent();
	},
	bindEvent: function(){
		var me = this;
		if((me.$parentOffSet.width >= me.$ulOffSet.width || me.config.lockX) && (me.$parentOffSet.height >= me.$ulOffSet.height || me.config.lockY)){
			me.$ul.off('touchstart',doTouchStart);
			me.$ul.off('touchmove',doTouchMove);
			me.$ul.off('touchend',doTouchEnd);
			me.$ul.off('touchcancel',doTouchEnd);
			return;
		}
		var startXY,clientStartX,clientStartY;
		function doTouchStart(e){
			startXY = getXY(me.$ul);
			clientStartX = getPageX(e);
			clientStartY = getPageY(e);
		}
		function doTouchMove(e){
			e.preventDefault();
			e.stopPropagation();
			var config = me.config;
			if(startXY != void 0 && clientStartX != void 0 && clientStartY != void 0){
				var changeX = getPageX(e) - clientStartX;
				var changeY = getPageY(e) - clientStartY;
				var curX,curY;
				if(config.lockY&&!config.lockX){
					// 只能横向
					if(Math.abs(changeX) > Math.abs(changeY)){
						curX = startXY.x + changeX;
						if(curX > me.maxOffSetX){
							curX = me.maxOffSetX;
						}
						if(curX < me.minOffSetX){
							curX = me.minOffSetX
						}
						setXY(me.$ul, curX, startXY.y);
					}
				}else if(config.lockX&&!config.lockY){
					// 只能纵向
					if(Math.abs(changeX) < Math.abs(changeY)){
						curY = startXY.y + changeY;
						if(curY > me.maxOffSetY){
							curY = me.maxOffSetY;
						}
						if(curY < me.minOffSetY){
							curY = me.minOffSetY;
						}
						setXY(me.$ul,startXY.x, curY);
					}
				}else if(!config.lockX&&!config.lockY){
					// 横向 纵向 都可以
					curX = startXY.x + changeX;
					if(curX > me.maxOffSetX){
						curX = me.maxOffSetX;
					}
					if(curX < me.minOffSetX){
						curX = me.minOffSetX
					}
					curY = startXY.y + changeY;
					if(curY > me.maxOffSetY){
						curY = me.maxOffSetY;
					}
					if(curY < me.minOffSetY){
						curY = me.minOffSetY;
					}
					setXY(me.$ul,curX,curY);
				}

			}
		}
		function doTouchEnd(e){
			var curXY = getXY(me.$ul);
			var config = me.config;
			var curX,curY;
			if(config.lockY&&!config.lockX){
				// 只能横向
				if(curXY.x > 0){
					setXY(me.$ul, 0, startXY.y);
				}
				if(curXY.x < -me.$ulOffSet.width + me.$parentOffSet.width){
					setXY(me.$ul, -me.$ulOffSet.width + me.$parentOffSet.width, startXY.y);
				}
			}else if(config.lockX&&!config.lockY){
				// 只能纵向
				if(curXY.y > 0){
					setXY(me.$ul, startXY.x, 0);
				}
				if(curXY.y < -me.$ulOffSet.height + me.$parentOffSet.height){
					setXY(me.$ul, startXY.x, -me.$ulOffSet.height + me.$parentOffSet.height);
				}
			}else if(!config.lockX&&!config.lockY){
				// 横向 纵向 都可以
				curX = startXY.x;
				curY = startXY.y;
				if(curXY.x > 0){
					curX = 0;
				}
				if(curXY.x < -me.$ulOffSet.width + me.$parentOffSet.width){
					curX = -me.$ulOffSet.width + me.$parentOffSet.width;
				}
				if(curXY.y > 0){
					curY = 0;
				}
				if(curXY.y < -me.$ulOffSet.height + me.$parentOffSet.height){
					curY = -me.$ulOffSet.height + me.$parentOffSet.height;
				}
				setXY(me.$ul, curX, curY);
			}
			startXY = void 0;
			clientStartX = void 0;
			clientStartY = void 0;
		}
		// off
		me.$ul.off('touchstart',doTouchStart);
		me.$ul.off('touchmove',doTouchMove);
		me.$ul.off('touchend',doTouchEnd);
		me.$ul.off('touchcancel',doTouchEnd);
		// on
		me.$ul.on('touchstart',doTouchStart);
		me.$ul.on('touchmove',doTouchMove);
		me.$ul.on('touchend',doTouchEnd);
		me.$ul.on('touchcancel',doTouchEnd);
	}
});
