var Callapp = (function() {
    function url2obj(url) {
        var re = {},
            unUrl,
            params;

        if (url.length && url.substr(0, 5) !== 'data:') {
            //将query前后分开
            unUrl = url.split('?');

            //无query或?有多个
            if (unUrl.length == 1) {
                unUrl = url.split('#');
                if (unUrl.length >= 2) {
                    unUrl = [unUrl[0], '#' + unUrl.slice(1).join('#')];
                } else {
                    unUrl = [unUrl[0], ''];
                }
            } else if (unUrl.length > 2) {
                unUrl = [unUrl[0], unUrl.slice(1).join('?')];
            }

            //尝试处理protocol
            unUrl[0] = unUrl[0].split('//');
            if (unUrl[0].length !== 2) {
                //与预期不符的统一处理
                unUrl[0] = [undefined, unUrl[0].join('//')];
            }

            if (unUrl[0][0] !== undefined) {
                re.protocol = unUrl[0][0];
            }
            re.path = unUrl[0][1];

            //取query部分
            //先把hash处理掉
            params = unUrl[1].split('#');
            if (params.length >= 2) {
                re.hash = params.slice(-1)[0];
                params = params.slice(0, -1).join('#');
            } else {
                params = params[0];
            }

            //将query分成键值对
            if (params) {
                re.params = {};
                params = params.split('&');
                for (var i = 0, maxi = params.length; i < maxi; i++) {
                    params[i] = params[i].split('=');
                    if (params[i][1] !== undefined) {
                        params[i][1] = params[i].slice(1).join('=');
                        try {
                            params[i][1] = decodeURIComponent(params[i][1]);
                        } catch(e) {
                        }
                    }
                    re.params[params[i][0]] = params[i][1];
                }
            }
        }

        return re;
    }

    function obj2url(obj) {
        var re = [],
            query = [];

        if (obj.protocol !== undefined) {
            re.push(obj.protocol + '//');
        }
        if (obj.path !== undefined) {
            obj.path && re.push(obj.path);
        }

        if (obj.params !== undefined) {
            re.push('?');
            for (var key in obj.params) {
                if (obj.params.hasOwnProperty(key)) {
                    if (obj.params[key] !== undefined) {
                        query.push([key, '=', encodeURIComponent(obj.params[key])].join(''));
                    } else {
                        query.push(key);
                    }
                }
            }
            re.push(query.join('&'));
        }

        obj.hash && re.push('#' + obj.hash);

        return re.join('');
    }

    function appendParams(url) {
        var points = ['ali_trackid', 'refpid', 'pid'],
            h5_uid = document.cookie.match(/(?:^|\s)cna=([^;]+)(?:;|$)/),
            currentUrl = url2obj(location.href),
            params = {};

        if (currentUrl.params) {
            //透传参数
            for (var key in currentUrl.params) {
                if (!url.params.hasOwnProperty(key)) {
                    url.params[key] = currentUrl.params[key];
                }
            }

            //添加point参数
            params.from = 'h5';

            for (var i = 0, maxi = points.length; i < maxi; i++) {
                if (currentUrl.params[points[i]]) {
                    params[points[i]] = currentUrl.params[points[i]];
                }
            }

            if (h5_uid) {
                params.h5_uid = h5_uid[1];
            }

            delete currentUrl.params;
            delete currentUrl.hash;
            params.url = obj2url(currentUrl);

            url.params.point = JSON.stringify(params);
        }

        return url;
    }

    function useAnchorLink(url) {
        var a = document.createElement('a'),
            e = document.createEvent('HTMLEvents');

        a.setAttribute('href', url);
        a.style.display = 'none';
        document.body.appendChild(a);

        e.initEvent('click', false, false);
        a.dispatchEvent(e);
    }

    function callInIframe(url) {
        var iframe = document.createElement('iframe');

        iframe.id = 'callapp_iframe_' + Date.now();
        iframe.frameborder = '0';
        iframe.style.cssText = 'display:none;border:0;width:0;height:0;';

        function add() {
            document.body.appendChild(iframe);
            iframe.src = url;
        }

        if (document.readyState == "complete" || document.readyState == "loaded") {
            add();
        } else {
            window.addEventListener("load", function() {
                add();
            });
        }
    }

    function wakeup(url, options) {
        var url = url2obj(url),
            tbopen = 'tbopen://m.taobao.com/tbopen/index.html?action=ali.open.nav&module=h5&bootImage=0&h5Url=',
            ua = navigator.userAgent,
            isiOS = /iPhone|iPad|iPod/i.test(ua),
            iOS9SafariFix,
            AndroidBCFix,
            iOS_version;

        options = options || {};

        appendParams(url);

        //iOS >= 9.0且是Safari，需要用a标签
        if (isiOS && /Safari/i.test(ua)) {
            iOS_version = ua.match(/Version\/([\d\.]+)/i);
            if (iOS_version && iOS_version.length == 2) {
                iOS_version = +iOS_version[1];
                if (iOS_version >= 9) {
                    iOS9SafariFix = true;
                }
            }
        }

        //百川需要用tbopen
        if (!isiOS && /AliApp\(BC\/\d+/i.test(ua)) {
            AndroidBCFix = true;
        }

        if (iOS9SafariFix) {
            /**
             * iOS9以上的Safari里，使用iframe打开url scheme没有任何反应
             */
            url.protocol = options.scheme || 'taobao:';
            useAnchorLink(obj2url(url));
        } else if (AndroidBCFix && options.scheme === undefined) {
            callInIframe(tbopen + encodeURIComponent(obj2url(url)));
        } else {
            /**
             * 在如网易的webview里，iframe的生成需要等待DOM的load事件。其表现和Safari中的非常类似，怀疑是WebKitWebView。
             */
            url.protocol = options.scheme || 'taobao:';
            callInIframe(obj2url(url));
        }
    }

   // window.lib = window.lib || {};
   // window.lib.callapp = window.lib.callapp || {};
   // window.lib.callapp.gotoPage = wakeup;
})();
module.exports = Callapp
