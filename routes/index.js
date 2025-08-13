
const router = require('koa-router')()
const controller = require('../controller/api.js')
const path = require('path')

const multer = require('@koa/multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,path.join(__dirname, '../public/uploads')); // 文件存储的目录
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    ); // 文件名设置
  },
});
const upload = multer({ storage: storage })


//新增：随机获取5首歌
router.get('/getRandomSongs', controller.getRandomSongs);

// 1.轮播图获取
router.get('/getSwiper', controller.getSwiper)
// 2 推荐歌单
router.get('/getRecommendSongList', controller.getSongList)
// 3 推荐歌手
router.get('/getRecommendSinger', controller.getSingerList)

// 4 歌手详情通过歌手Id
router.get('/getSingerDetail', controller.getSingerDetail)
// 5 歌单详情通过歌单Id 
router.get('/getListSongDetail', controller.getListSongDetail)

// 6 歌单所有列表
router.get('/getAllSongList', controller.getAllSongList)
// 7. 歌手所有列表
router.get('/getAllSinger', controller.getAllSinger)
// 8 搜索
router.get('/searchSong', controller.searchSong)
// 9. 歌曲详情
router.get('/getSongDetail', controller.getSongDetail)


// 10登录
router.post('/login',controller.login)
// 11 我的喜欢
//getMySongList
router.get('/getMySongList',controller.getMySongList)


// 12.评论列表
router.get('/commentList',controller.commentList)
// 13.添加评论或回复
router.post('/addComment',controller.addComment)

// 14.通过评论ID 获取回复评论列表
router.get('/getReplyComment',controller.getReplyComment)

// 15 收藏与取消收藏
router.get('/setCollect',controller.setCollect)
// 16 判断是否收藏
router.get('/isCollect',controller.isCollect)



// 17 修改用户信息
router.post('/userEdit',controller.userEdit)

//【听歌报告】
// 18. 生成月度报告 (内部使用, 用 POST)
router.post('/reports/generate', controller.generateMonthlyReport)
// 19. 获取月度报告 (给前端用, 用 GET)
router.get('/reports/monthly', controller.getMonthlyReport)
// 20. 获取最近报告列表
router.get('/reports/recent', controller.getRecentReports);

//*********************************新增**************************************** */
// 获取带有歌手信息的歌曲列表（用于首页"大家都在听"）
router.get('/getSongListWithSinger',controller.getSongListWithSinger)


//*********************************新增****************************************
// 【新增：添加播放记录】使用 POST 方法
router.post('/addPlayRecord', controller.addPlayRecord)

//*********************************新增****************************************
// 【新增】21. 获取指定月份的听歌天数
router.get('/play-records/days-in-month', controller.getPlayRecordDaysInMonth);
// 【新增】22. 获取指定月份的唱片墙数据
router.get('/play-records/album-wall', controller.getAlbumWallData);

//获得用户创建的所有歌单===============================
router.get('/getUserCreatedSongLists',controller.getUserCreatedSongLists)
//获得用户收藏的歌单===============================
router.get('/getCollectedPlaylistsByUserId',controller.getCollectedPlaylistsByUserId)
//新建歌单
router.post('/createSongList', controller.createSongList);
//获取最近播放歌单
router.get('/getRecentPlayed',controller.getRecentPlayed)
//向歌单添加歌曲
router.post('/addSongsToList',controller.addSongsToList)
//【互动广场】
// 获取所有帖子
router.get('/getAllPosts', controller.getAllPosts);
router.get('/getPostImages', controller.getPostImages);
router.get('/getPostComments', controller.getPostComments);

//[最近播放] 获取播放记录
router.get('/getPlayRecord',controller.getPlayRecord)

//+++++++++++++++++++++++++++++++++++++++++++++++++
router.post('/createPost',controller.createPost)

router.post('/addPostComment', controller.addPostComment);

router.post('/uploads',upload.single('file'),async (ctx,next)=>{
  const file = ctx.file
  console.log('Multer处理后的文件:',file)
  if (!file) {
    ctx.body = {
      code: 400,
      message: '没有文件被上传，或字段名不匹配'
    };
    return;
  }
  //ctx.body = {code:200,message:'上传成功',data:file.filename}
  const relativePath = `${file.filename}`;
  
  console.log('文件上传成功，返回给前端的相对路径是:', relativePath);

  ctx.body = {
    code: 200,
    message: '上传成功',
    data: relativePath // ★ 返回这个拼接好的相对路径
  };
})


// 【新增】更新歌单信息
// 使用 PUT 方法，符合RESTful规范，:id 是一个动态参数
router.post('/song-lists/:id', controller.updateSongList);
module.exports = router


  router.get('/getSongListsByStyle', controller.getSongListsByStyle);