
// 证明是线下
seajs.config({
    base: 'http://' + location.host
})
seajs.use(['src/magix/index'], function(Magix) {
    Magix.config({
      defaultView: 'examples/main'
    })
    Magix.boot()
})

