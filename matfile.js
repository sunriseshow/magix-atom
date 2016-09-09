var mat = require('mat')
var fs = require('fs')
var path = require('path')
var combineTool = require('magix-combine')


combineTool.config({
  prefix: 'mx',
  tmplFolder: './',
  tmplCommand: /<%[\s\S]+?%>/g,
  loaderType: 'cmd'
})

mat.env({
  port:4001,
  combohandler: true
})

mat.task('dev', function() {
  var analyse = function() {
    return function* combine(next) {
      yield next

      if (/sea\.js|\.json/.test(this.path)) return

      var body = this.body.toString()
      if (body == 'Not Found') {
        throw new Error('路径：' + this.path + ' 对应的文件没有找到')
      }
      // 对source进行加工，变成amd里面define的包裹格式
      if ((!/define\s*\(\s*['"]\s*[\w\W]+['"]/.test(body) && !/Magix\.boot/.test(body)) || /define\.amd/.test(body)) {
        //var p = this.path.replace('/src','/atom')
        var file = path.join(__dirname, this.path)
        body = yield combineTool.processContent(file, '', body)
      }

      //body = body.toString().replace(/define\('src/,"define\('atom")
      body = body.toString().replace(/atom\//g,"src/")
      body = body.toString().replace("define('atom/magix/index', ['atom/zepto/index']","define('src/magix/index', ['src/zepto/index']")


      this.body = body
    }
  }

  //对于js进行define的包裹
  mat.url([/.js/])
    // .rewrite([
    //   [/\/atom/, '/src']
    // ])
    .use(analyse())
})
