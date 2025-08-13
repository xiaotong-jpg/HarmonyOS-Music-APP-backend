const model = require('../model/index')
const Swiper = model.swiper  // 轮播图表
const SongList = model.song_list // 歌单表
const Song = model.song // 歌曲表
const ListSong= model.list_song // 歌单歌曲表
const Singer = model.singer // 歌手表
const Consumer = model.consumer
const Collect = model.collect
const Comment = model.comment
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const md5 = require('md5')
//【新增，注意这里的名字是js文件名为不是数据库表名】
const PlayRecord = model.playRecord // 引入播放记录模型
const ListeningReport = model.listeningReport // 引入听歌报告模型
const PostImage = model.postImage  // 注意这里是 postImage
const PostComment = model.postComment // 注意这里是 postComment
//++++++++++++++++++++++++++++++++++++++
const Post = model.post
const { sequelize } = require('../model/index');


//新增：随机获取5首歌
exports.getRandomSongs = async (ctx, next) => {
  // 允许通过查询参数自定义数量，默认为 5 首
  const { limit = 5 } = ctx.query;

  try {
      const randomSongs = await Song.findAll({
          // 使用 Sequelize.literal('RAND()') 来调用数据库的原生随机函数，效率最高
          order: Sequelize.literal('RAND()'), 
          limit: parseInt(limit) // 限制返回的数量
      });
      
      ctx.body = {
          code: 200,
          message: '获取随机歌曲成功',
          data: randomSongs
      };

  } catch (error) {
      console.error('获取随机歌曲失败:', error);
      ctx.body = { code: 500, message: '服务器内部错误' };
  }
};

// 1.获得轮播图
module.exports.getSwiper = async (ctx, next) => {
     const swiper = await Swiper.findAll()
     ctx.body = {code: 200, message:'轮播图成功',data: swiper}
}
// 2. 获得推荐歌单
// 2. 获得推荐歌单
exports.getSongList = async (ctx, next) => {
    const songList = await SongList.findAll({
      where: {
        title: {
            // [Op.notIn] 的意思是：标题 "不包含在" 下面的数组中
            [Op.notIn]: ['热搜榜', '热歌榜', '飙升榜']
        }
    },
        limit:6,   // 获取6条数据
        order: Sequelize.literal('RAND()'),
    })
    ctx.body = {code: 200, message:'歌单成功',data: songList}
}
// 3. 获得推荐歌手
// 3. 获得推荐歌手
exports.getSingerList = async (ctx, next) => {
    const singer = await Singer.findAll({
        limit:15,   // 获取6条数据
        order: Sequelize.literal('RAND()'),
    })
    ctx.body = {code: 200, message:'歌手成功',data: singer}
}

// 4 . 获得歌手详情,下面有对应歌曲
exports.getSingerDetail = async (ctx, next) => {
    const {id}= ctx.request.query
    const singer = await Singer.findOne({
        where: {
            id: id
        },
        include: [{
            model: Song,
            //attributes: ['id', 'name', 'url', 'pic','introduction']
        }]
    })
    ctx.body = {code: 200, message:'歌手详情成功',data: singer}
}
// 5. 获得歌单详情
// 5. 获得歌单详情 (已修复和优化)
exports.getListSongDetail = async (ctx, next) => {
    const { id } = ctx.request.query;

    if (!id) {
        ctx.body = { code: 400, message: '缺少歌单ID', data: null };
        return;
    }

    try {
        // 第1步：先查询歌单本身的信息
        const songListInfo = await SongList.findOne({
            where: { id: id },
            attributes: ['id', 'title', 'pic', 'introduction']
        });

        // 如果歌单不存在，直接返回
        if (!songListInfo) {
            ctx.body = { code: 404, message: '歌单不存在', data: null };
            return;
        }

        // 第2步：查询这个歌单包含的所有歌曲
        const songAssociations = await ListSong.findAll({
            where: { song_list_id: id },
            // 使用 include 直接联表查询 songs 表
            include: [{
                model: Song,
                //attributes: ['id', 'name', 'url', 'pic', 'introduction', 'singer_id'] // 包含 singer_id 以便未来使用
            }],
            order: [
                // 你可以根据需要对歌曲进行排序
                // ['createdAt', 'ASC']
            ]
        });

        // 第3步：从查询结果中提取干净的歌曲列表
        const songs = songAssociations.map(item => item.song);

        // 第4步：组装最终返回给前端的数据结构
        const responseData = {
            songList: songListInfo,
            songs: songs
        };

        console.log(`成功获取歌单ID: ${id} 的详情, 包含 ${songs.length} 首歌曲。`);
        ctx.body = { code: 200, message: '歌单详情成功', data: responseData };

    } catch (error) {
        console.error(`获取歌单详情时发生错误, ID: ${id}`, error);
        ctx.body = { code: 500, message: '服务器内部错误', data: null };
    }
}
// 6 带分页歌单所有列表
exports. getAllSongList = async (ctx) => { 
    const {page=1, pageSize=6} = ctx.query
    const songList = await SongList.findAll({
      where: {
        title: {
            // [Op.notIn] 的意思是：标题 "不包含在" 下面的数组中
            [Op.notIn]: ['热搜榜', '热歌榜', '飙升榜']
        }
    },
        limit: pageSize,   // 获取6条数据
        //offset: (page - 1) * pageSize,  // 跳过多少条数据
        order: Sequelize.literal('RAND()'),
    })
    ctx.body = {code: 200, message:'歌单所有列表成功',data: songList}
}
// 7. 带分页歌手所有列表
exports.getAllSinger = async (ctx) => { 
    const {page=1, pageSize=15} = ctx.query
    const singer = await Singer.findAll({
        limit: pageSize,   // 获取6条数据
        //offset: (page - 1) * pageSize,  // 跳过多少条数据
        order: Sequelize.literal('RAND()')
    })
    ctx.body = {code: 200, message:'歌手所有列表成功',data: singer}
}

// 8 带分页搜索歌曲searchSong
exports.searchSong = async (ctx) => {
    const {keywords,page=1, pageSize=3, type=1} = ctx.query
    let list = null
    if(type == 1){  // 搜索歌曲
        list = await Song.findAll({
            where: {
                name: {
                    [Op.like]: `%${keywords}%`
                }
            },
            limit: pageSize,   // 获取6条数据
            offset: (page - 1) * pageSize,  // 跳过多少条数据
            order : [['id', 'asc']]  // 升序
        })
    } else if(type == 2){  // 搜索歌手
        list = await Singer.findAll({
            where: {
                name: {
                    [Op.like]: `%${keywords}%`
                }
            },
            limit: pageSize,   // 获取6条数据
            offset: (page - 1) * pageSize,  // 跳过多少条数据
            order : [['id', 'asc']]  // 升序
        })
    }else if(type == 3){  // 搜索歌单
        list = await SongList.findAll({
            where: {
                title: {
                    [Op.like]: `%${keywords}%`
                }
            },
            limit: pageSize,   // 获取6条数据
            offset: (page - 1) * pageSize,  // 跳过多少条数据
            order : [['id', 'asc']]  // 升序
        })
    }
    datas = {
        list,
        type
    }
    ctx.body = {code: 200, message:'获取成功',data: datas}
}
// 通过Id ,获取歌曲详情 
exports.getSongDetail = async (ctx) => {
    const {id}= ctx.request.query
    console.log(id)
    const song = await Song.findAll({
        where: {
            id: id
        },
        include: [{
            model: Singer
        }]
    })
    ctx.body = {code: 200, message:'获取成功',data: song}
}

// 登录
exports.login = async (ctx, next) =>{
        const {username, password} = ctx.request.body
        const user = await Consumer.findOne({
            where:{
                username,
                password:md5(password)
            },
            //attributes:['username','avatar']  
        })
        // 存token 返回给客户的
        if(user){
            // 登录成功
            ctx.body = {code: 200, message:"登录成功",data:{user}}
        }

}
exports.getMySongList= async (ctx, next) =>{
    //const userId =  传回来的token 解码后拿到的userId 
    const userId = 2 // 用户固定
    let list = await Collect.findAll({
        where:{user_id:userId},
        attributes:['id'],
        include:[{model:Song},{model:Consumer,attributes:['username','avatar']}]
        
    })

    let  newList = {}
    let songs = []
    if(list.length > 0){
        newList.consumer = list[0].consumer
        list.forEach(item => {
            songs.push(item.song)    
        })
    }
    newList.songs = songs
    ctx.body = {code: 200, message:"我的歌单",data: newList}
}

// 评论列表
exports.commentList= async (ctx, next) =>{
    const include = [{model:Consumer,attributes:['username','avatar',]}]

    let lists = await Comment.findAll({
        include,
        order:[['createdAt','DESC']],
        raw:true,  // 返回的数据是原始的
        nest:true
    })
    console.log(lists)
    let resData = []
    lists.forEach(item=>{
        let reply = lists.filter(data=>data.up==item.id) // 返回每条评论下的回复列表
        if(reply.length>0){
            item.reply = reply
        }
        if(item.up==0){
            resData.push(item)
        }
    })
    resData = await Promise.all(resData.map(async item => {
            // 假设这里直接通过item.song获取歌曲信息，根据实际情况调整
            if(item.song_id){
                // 歌曲
                let song = await Song.findOne({
                where: { id: item.song_id }
                });
                // 点赞数
                let likeCount = await Collect.count({
                    where: { song_id: item.song_id }
                })
                // 评论数
                // 不等于 up
                let commentCount = await Comment.count({
                    where: { song_id: item.song_id, up: { [Op.ne]: 0 } }
                })
                // 歌手
                let singer = await Singer.findOne({
                    where: { id: song.singer_id },
                    attributes: ['name']
                });
                
                return {
                    ...item,
                    song: song,
                    singer: singer.name,
                    commentCount,
                    likeCount

                };
            }
    }));
    ctx.body = {code: 200, message:"评论列表",data: resData}
}
// 添加评论 up=0，回复评论 up不是0 
exports.addComment= async (ctx, next) =>{
    const userId = 2
    const {content,type=1,up=0,songId}  = ctx.request.body
    console.log(content,type,up,userId,songId)
    await Comment.create({content,type,up,user_id:userId,song_id:songId})
    ctx.body = {code: 200, message:"添加成功",data: null}
}
// 删除评论
exports.delComment= async (ctx, next) =>{
    const {id} = ctx.query
    await Comment.destroy({where:{id}})
}

// 通过评论ID 获取回复评论列表
exports.getReplyComment= async (ctx, next) =>{
    const {id} = ctx.query
    const include = [{model:Consumer,attributes:['username','avatar',]}]

    let lists = await Comment.findAll({
        where:{up:id},
        include,
        order:[['createdAt','DESC']],
        raw:true,  // 返回的数据是原始的
        nest:true
    })
    ctx.body = {code: 200, message:"回复评论列表",data: lists}
}

// 收藏歌曲
exports.setCollect= async (ctx, next) =>{
    const {id,action} = ctx.query  // action =='add'  'cancel'
    // 带用户信息的操作
    const userId = 2
    if(action=='add'){ // 收藏 create
        await Collect.create({song_id:id,user_id:userId})

    }else{ // 取消 destory
        await Collect.destroy({where:{song_id:id,user_id:userId}})
    }
    ctx.body = {code: 0, message:"收藏操作成功"}
}

// 判断是否是收藏或取消收藏，在第一次加载页面必须保持一致
exports.isCollect= async (ctx, next) =>{
    const {ids} = ctx.query
    const userId = 2
    let res = await Collect.findAll({
        // in 查询 ids 是数组
        where: {song_id:{[Op.in]: ids.split(',')},user_id:userId}
    })
    //
    res = ids.split(',').map(id=>{
        return res.find(item=>item.song_id == id)?true:false
    })
    
    ctx.body = {code: 0, message:"是否收藏",data:res}
    
}

// 修改用
exports.userEdit= async (ctx, next) =>{
    //const userId = ctx.user.id
    const userId = 2
    let params = ctx.request.body
    console.log(params)
    params.password = md5(params.password)
    params.updatedAt = new Date()
    const res = await Consumer.update(params,{where:{id:userId}})
    if(res[0]==1){
        ctx.body = {code: 0, message:"修改成功"}
    }else{
        ctx.body = {code: 1, message:"修改失败"}
    }

}
// 获取播放记录
exports.getPlayRecord = async (ctx, next) => {
  const { userId } = ctx.request.query; // 从 query 中获取
  if (!userId) {
      ctx.body = { code: 400, message: '缺少 userId 参数' };
      return;
  }

  const playRecords = await PlayRecord.findAll({
      where: { user_id: userId },
      include: [
          { model: Song, attributes: ['id', 'name', 'url', 'pic'] },
          { model: SongList, attributes: ['id', 'title'] }
      ],
      order: [['play_time', 'DESC']]
  });

  ctx.body = { code: 200, message: '播放记录获取成功', data: playRecords };
}


//【生成月度听歌报告】 (这是一个内部处理接口)
// 生成月度听歌报告
exports.generateMonthlyReport = async (ctx, next) => {
  const { user_id, period } = ctx.request.body;

  if (!user_id || !period || !/^\d{4}-\d{2}$/.test(period)) {
    ctx.body = { code: 400, message: '参数错误，需要 user_id 和 YYYY-MM 格式的 period' };
    return;
  }

  // --- 1. 计算时间范围 ---
  const startDate = new Date(`${period}-01T00:00:00`);
  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);
  endDate.setDate(0);
  endDate.setHours(23, 59, 59, 999);

  // --- 2. 查询播放记录并关联歌曲信息 ---
  // 这里需要确保模型关联已设置好
  const playRecords = await PlayRecord.findAll({
    where: {
      user_id: user_id,
      play_time: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [{ model: Song, attributes: ['singer_id'] }]
  });

  if (playRecords.length === 0) {
    ctx.body = { code: 200, message: '该用户在此期间没有播放记录' };
    return;
  }
  
  // --- 3. 数据分析 ---
  const songCounts = {};
  const singerCounts = {};
  const hourCounts = {};

  playRecords.forEach(record => {
    // 统计歌曲播放次数
    songCounts[record.song_id] = (songCounts[record.song_id] || 0) + 1;
    
    // 统计歌手播放次数
    if (record.song && record.song.singer_id) {
        singerCounts[record.song.singer_id] = (singerCounts[record.song.singer_id] || 0) + 1;
    }

    // 统计小时播放次数
    const hour = new Date(record.play_time).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const findMaxKey = (obj) => Object.keys(obj).length > 0 ? Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b) : null;

  const favorite_song_id = findMaxKey(songCounts);
  const favorite_singer_id = findMaxKey(singerCounts);
  const most_active_hour = findMaxKey(hourCounts);
  
  // --- 4. 组装报告数据 ---
  const reportData = {
    user_id,
    report_type: 'monthly',
    report_period: period,
    total_songs_played: playRecords.length,
    favorite_song_id: favorite_song_id ? parseInt(favorite_song_id) : null,
    favorite_singer_id: favorite_singer_id ? parseInt(favorite_singer_id) : null,
    most_active_hour: most_active_hour ? parseInt(most_active_hour) : null
  };

  // --- 5. 存储到数据库 ---
  await ListeningReport.upsert(reportData);

  ctx.body = { code: 200, message: '月度报告生成成功', data: reportData };
};

// 获取月度听歌报告
exports.getMonthlyReport = async (ctx, next) => {
  const { user_id, period } = ctx.query;

  if (!user_id || !period) {
    ctx.body = { code: 400, message: '参数错误' };
    return;
  }

  const report = await ListeningReport.findOne({
    where: {
      user_id: user_id,
      report_type: 'monthly',
      report_period: period,
    }
  });

  if (report) {
    ctx.body = { code: 200, message: '获取报告成功', data: report };
  } else {
    ctx.body = { code: 404, message: '报告不存在，请先生成报告' };
  }
};

//一次性返回用户最近N个月的报告
exports.getRecentReports = async (ctx, next) => {
  const { user_id, limit = 5 } = ctx.query; // 默认获取最近5个月

  if (!user_id) {
    ctx.body = { code: 400, message: '需要 user_id' };
    return;
  }

  try {
    const reports = await ListeningReport.findAll({
      where: {
        user_id: user_id,
        report_type: 'monthly'
      },
      order: [
        ['report_period', 'DESC'] // 按报告周期降序排列
      ],
      limit: parseInt(limit) // 限制返回的数量
    });
    
    // 返回前，最好再按升序排一次，方便前端直接绘图
    const sortedReports = reports.sort((a, b) => a.report_period.localeCompare(b.report_period));

    ctx.body = { code: 200, message: '获取成功', data: sortedReports };
  } catch (error) {
    ctx.body = { code: 500, message: '服务器错误', error };
  }
}


//*********************************新增**************************************** */
// 获取带有歌手信息的歌曲列表（用于首页"大家都在听"）
// 这里对数据进行格式化，返回更清晰的结构，只返回id, name, pic, singerName
exports.getSongListWithSinger = async (ctx, next) => {
    try {
        const songs = await Song.findAll({
            limit: 9, 
            order: Sequelize.literal('RAND()'),
            include: [{
                model: Singer,
                attributes: ['name'] // 只从singer表取name
            }],
            // 只从song表取这三个字段
            attributes: ['id', 'name', 'pic'], 
        });

        // 将嵌套数据格式化为扁平结构
        const formattedSongs = songs.map(song => ({
            id: song.id,
            songName: song.name, // 字段重命名，更清晰
            pic: song.pic,
            singerName: song.singer ? song.singer.name : '未知歌手'
        }));

        ctx.body = {
            code: 200,
            message: '获取歌曲列表成功',
            data: formattedSongs // 返回格式化后的数据
        };

    } catch (error) {
        console.error('Error in getSongListWithSinger:', error);
        ctx.body = { code: 500, message: '服务器内部错误' };
    }
};

//*********************************新增****************************************
//【新增：添加播放记录】
// 注意：这个接口应该用 POST 请求，因为它会创建或修改数据
exports.addPlayRecord = async (ctx) => {
    try {
        const { song_id, user_id } = ctx.request.body;

        // 【重要】
        // 在你的项目中，登录后，用户信息应该存储在前端。
        // 调用这个接口时，前端必须把当前登录用户的 ID (user_id) 传过来。
        // 这里不再写死 `const userId = 2`，而是从请求体中获取。
        if (!song_id || !user_id) {
            ctx.status = 400; // Bad Request
            ctx.body = { success: false, message: '参数错误，song_id 和 user_id 不能为空' };
            return;
        }

        // 优化逻辑：查找该用户对该歌曲的最新一条播放记录
        const existingRecord = await PlayRecord.findOne({
            where: {
                user_id: user_id,
                song_id: song_id
            },
            order: [['play_time', 'DESC']]
        });

        if (existingRecord) {
            // 如果已存在记录，则更新播放时间为当前时间
            // 使用 Sequelize.literal('NOW()') 来确保使用数据库的当前时间
            await existingRecord.update({ play_time: Sequelize.literal('NOW()') });
            console.log(`Updated play record for user_id: ${user_id}, song_id: ${song_id}`);
        } else {
            // 如果不存在，则创建一条新记录
            await PlayRecord.create({
                user_id: user_id,
                song_id: song_id
                // play_time 字段会使用数据库模型的默认值 NOW()
            });
            console.log(`Created new play record for user_id: ${user_id}, song_id: ${song_id}`);
        }

        ctx.status = 200;
        ctx.body = {
            success: true, // 使用 success 字段，与你前端的判断逻辑保持一致
            message: '播放记录成功'
        };

    } catch (error) {
        console.error('添加播放记录失败:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: '服务器内部错误',
            error: error.message
        };
    }
};


//*********************************新增****************************************
// 【新增】获取用户在指定月份有播放记录的所有日期
exports.getPlayRecordDaysInMonth = async (ctx, next) => {
  const { user_id, month } = ctx.query; // month 格式为 'YYYY-MM'

  if (!user_id || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return ctx.body = { code: 400, message: '参数错误，需要 user_id 和 YYYY-MM 格式的 month' };
  }

  try {
    // 1. 计算查询的月份范围
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1); // 移动到下个月的第一天

    // 2. 查询数据库
    const records = await PlayRecord.findAll({
      where: {
        user_id: user_id,
        play_time: {
          [Op.gte]: startDate, // 大于等于本月第一天
          [Op.lt]: endDate      // 小于下个月第一天
        }
      },
      // 3. 只选择 play_time 字段，提高效率
      attributes: ['play_time'],
      order: [['play_time', 'ASC']]
    });

    // 4. 处理结果，提取出不重复的“天”
    const listenedDays = new Set();
    records.forEach(record => {
      const day = new Date(record.play_time).getDate(); // getDate() 返回月份中的第几天 (1-31)
      listenedDays.add(day);
    });

    // 5. 将 Set 转换为数组并返回
    ctx.body = {
      code: 200,
      message: '获取成功',
      data: Array.from(listenedDays) // 例如返回 [1, 2, 5, 15, 28]
    };

  } catch (error) {
    console.error('获取听歌日历数据失败:', error);
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};
// 【新增】获取用户在指定月份的唱片墙数据
// 【新增】获取用户在指定月份的唱片墙数据 (按最新播放排序)
exports.getAlbumWallData = async (ctx, next) => {
  const { user_id, month } = ctx.query; // month 格式 'YYYY-MM'

  if (!user_id || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return ctx.body = { code: 400, message: '参数错误' };
  }

  try {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    // ========================================================================
    // =================== 【核心修改 1/3：修改查询逻辑】 ==================
    // ========================================================================
    // 1. 查询当月所有播放记录，并【按播放时间倒序】排序
    //    同时，直接 include 关联出歌曲信息
    const playRecords = await PlayRecord.findAll({
      where: {
        user_id: user_id,
        play_time: {
          [Op.between]: [startDate, endDate],
        },
      },
      // 按播放时间倒序排列，最新的记录在最前面
      order: [['play_time', 'DESC']],
      // 直接关联出每条记录对应的歌曲信息
      include: [{
        model: Song,
        attributes: ['id', 'pic', 'name']
      }]
    });
    // ========================================================================

    if (playRecords.length === 0) {
      return ctx.body = { code: 200, message: '当月无播放记录', data: [] };
    }

    // ========================================================================
    // =================== 【核心修改 2/3：在代码中去重】 ==================
    // ========================================================================
    // 2. 在代码层面进行去重，以保持播放时间的顺序
    const uniqueSongs = [];
    const seenSongIds = new Set(); // 使用 Set 来高效地跟踪已经添加的 song_id

    for (const record of playRecords) {
      // 检查这首歌的ID是否已经处理过
      if (record.song && !seenSongIds.has(record.song.id)) {
        uniqueSongs.push(record.song); // 将关联的歌曲对象加入结果数组
        seenSongIds.add(record.song.id); // 记录下这个ID
      }
    }
    // ========================================================================

    // 3. 返回去重后的、按最新播放时间排序的歌曲数组
    ctx.body = {
      code: 200,
      message: '获取唱片墙数据成功',
      data: uniqueSongs // 返回我们手动去重后的结果
    };

  } catch (error) {
    console.error('获取唱片墙数据失败:', error);
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};

//获得用户创建的所有歌单=======================================
exports.getUserCreatedSongLists = async (ctx, next) => {
  try {
    // ★ 1. 从URL的查询参数中获取 user_id
    const { user_id } = ctx.query;

    // ★ 2. (重要) 添加参数校验，确保 user_id 存在且是一个有效的数字
    if (!user_id || isNaN(parseInt(user_id))) {
      ctx.body = { 
        code: 400, 
        success: false, 
        message: '请求参数错误，必须提供有效的 user_id' 
      };
      return;
    }

    // 3. 使用从URL中获取的动态ID进行数据库查询
    const userSongLists = await SongList.findAll({
      where: {
        creator_id: user_id // ★ 使用动态的 user_id
      },
      order: [['updatedAt', 'DESC']]
    });

    // 4. 返回成功响应
    ctx.body = {
      code: 200,
      success: true,
      message: `成功获取用户ID ${user_id} 创建的歌单`,
      data: userSongLists
    };

  } catch (error) {
    // 在错误日志中也打印出是哪个用户ID出错了，方便排查
    console.error(`获取用户 ${ctx.query.user_id} 创建的歌单失败:`, error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器内部错误，获取歌单失败'
    };
  }
};
//获得收藏的歌单
exports.getCollectedPlaylistsByUserId = async (ctx) => {
  try {
    // ★ 1. 从URL的查询参数中获取 user_id
    const { user_id } = ctx.query;

    // ★ 2. (重要) 添加参数校验
    if (!user_id || isNaN(parseInt(user_id))) {
      ctx.body = { 
        code: 400, 
        success: false, 
        message: '请求参数错误，必须提供有效的 user_id' 
      };
      return;
    }

    // --- 第一步：从 Collect 表获取所有收藏的 song_list_id ---
    const collections = await Collect.findAll({
      where: { user_id: user_id }, // ★ 使用从URL获取的动态 user_id
      attributes: ['song_list_id']
    });

    // 如果该用户没有任何收藏记录
    if (collections.length === 0) {
      ctx.body = { 
        code: 200, 
        success: true, 
        message: `用户ID ${user_id} 暂无收藏歌单`, 
        data: [] // 返回一个空数组
      };
      return;
    }

    // 提取所有收藏的歌单ID
    const songListIds = collections.map(c => c.song_list_id);

    // --- 第二步：根据ID数组，去 SongList 表中查询对应的歌单详情 ---
    const collectedSongLists = await SongList.findAll({
      where: {
        id: {
          [Op.in]: songListIds
        }
      },
      // (可选) 您可以在这里 include 作者信息，使返回的数据更完整
      // include: [{ model: Consumer, as: 'creator', attributes: ['id', 'username'] }],
      order: [['updatedAt', 'DESC']]
    });

    // 4. 返回成功响应
    ctx.body = {
      code: 200,
      success: true,
      message: `成功获取用户ID ${user_id} 的收藏歌单`,
      data: collectedSongLists
    };

  } catch (error) {
    console.error(`获取用户 ${ctx.query.user_id} 的收藏歌单失败:`, error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器内部错误'
    };
  }
};

//创建歌单
exports.createSongList = async (ctx) => {
  try {
    // ★ 1. 从请求体中解构出 name 和 creator_id
    const { name, creator_id } = ctx.request.body;

    // ★ 2. (重要) 增加对参数的全面校验
    if (!name || !creator_id) {
      ctx.status = 400;
      ctx.body = { 
        code: 400, 
        success: false, 
        message: '歌单名称和创建者ID均不能为空' 
      };
      return;
    }

    // (可选) 进一步校验 creator_id 是否为有效数字
    if (isNaN(parseInt(creator_id))) {
      ctx.status = 400;
      ctx.body = { code: 400, success: false, message: '无效的创建者ID' };
      return;
    }

    // 3. 使用从请求体中获取的动态数据创建新记录
    const newSongList = await SongList.create({
      title: name,
      creator_id: creator_id // ★ 使用动态的 creator_id
    });

    // 4. 返回成功响应
    ctx.body = {
      code: 200,
      success: true,
      message: '歌单创建成功',
      data: newSongList
    };

  } catch (error) {
    console.error('创建歌单失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};
//获取最近播放歌单//api
exports.getRecentPlayed = async (ctx) => {
  try {
    // ★ 1. 从URL的查询参数中获取 user_id
    const { user_id } = ctx.query;

    // ★ 2. (重要) 添加参数校验
    if (!user_id || isNaN(parseInt(user_id))) {
      ctx.body = {
        code: 400,
        success: false,
        message: '请求参数错误，必须提供有效的 user_id'
      };
      return;
    }

    // 3. 使用从URL中获取的动态ID进行数据库查询
    const records = await PlayRecord.findAll({
      where: { user_id: user_id }, // ★ 使用动态的 user_id
      include: [
        {
          model: Song,
          include: [{
            model: Singer,
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['play_time', 'DESC']],
      limit: 50
    });
    
    // 4. (优化) 直接映射出包含歌手信息的歌曲对象
    //    Sequelize 的嵌套 include 结果需要这样展开
    const songsWithSinger = records.map(record => {
      // Sequelize 在 include 中会把关联模型挂在原模型上
      const songData = record.song.toJSON(); // 转为普通JS对象
      songData.singer = record.song.singer;  // 把歌手信息附加到 song 对象上
      return songData;
    });

    // 5. 返回成功响应
    ctx.body = {
      code: 200,
      success: true,
      message: `成功获取用户ID ${user_id} 的最近播放记录`,
      data: songsWithSinger
    };

  } catch (error) {
    console.error(`获取用户 ${ctx.query.user_id} 的最近播放记录失败:`, error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '服务器内部错误'
    };
  }
};
//向歌单中添加歌曲
exports.addSongsToList = async (ctx) => {
  try {
    const { song_list_id, song_ids } = ctx.request.body; // song_ids 是一个歌曲ID的数组

    if (!song_list_id || !song_ids || !Array.isArray(song_ids)) {
      ctx.status = 400;
      ctx.body = { code: 400, message: '参数错误' };
      return;
    }

    // 构造要批量创建的数据
    const recordsToCreate = song_ids.map(song_id => ({
      song_list_id: song_list_id,
      song_id: song_id
    }));

    // 使用 bulkCreate 批量插入，ignoreDuplicates 可以在重复时忽略错误
    await ListSong.bulkCreate(recordsToCreate, { ignoreDuplicates: true });

    ctx.body = { code: 200, message: '添加成功' };
  } catch (error) {
    console.error('创建歌单失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};
//【获取用户发帖数据】
exports.getAllPosts = async (ctx) => {
  try {
    // 查询所有 Post 表数据，并关联歌曲和图片
    const posts = await model.post.findAll({
      include: [
        {
          model: Song,
          as: 'song',
          attributes: ['id', 'name', 'pic'],
          
        },
        {
          model: Consumer,
          as: 'author', // 假设你在 Post 模型中定义了关联关系为 as: 'consumer'
          attributes: ['id', 'username', 'avatar']
        },   
      ],
      attributes: {
        include: [
          // 新增虚拟字段 singerName，值来自 Singer.name
          [
            Sequelize.literal(`(
              SELECT name FROM singers WHERE singers.id = song.singer_id
            )`),
            'singerName'
          ]
        ]
      },
      order: [['created_at', 'DESC']]
    });

    ctx.body = { code: 200, message: '获取成功', data: posts };
  } catch (error) {
    console.error('获取帖子数据失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};
// 根据帖子ID获取图片
exports.getPostImages = async (ctx) => {
  try {
    const { post_id } = ctx.query;

    if (!post_id) {
      ctx.body = { code: 400, message: '缺少 post_id 参数' };
      return;
    }

    // 查询该帖子下的所有图片
    const images = await PostImage.findAll({
      where: {
        post_id: post_id
      },
      attributes: ['id', 'image_url', 'order_index'],
      order: [['order_index', 'ASC']] // 按顺序返回
    });

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: images
    };
  } catch (error) {
    console.error('获取帖子图片失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};
//根据postid获取对应评论
exports.getPostComments = async (ctx) => {
  try {
    const { post_id } = ctx.query;

    if (!post_id) {
      ctx.body = { code: 400, message: '缺少 post_id 参数' };
      return;
    }

    // ✅ 使用 PostComment 模型来查询帖子评论
    const postComments = await model.postComment.findAll({
      where: {
        post_id: post_id
      },
      include: [
        {
          model: model.consumer,
          as: 'author', // 与模型定义的别名一致
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    ctx.body = {
      code: 200,
      message: '获取成功',
      data: postComments
    };
  } catch (error) {
    console.error('获取帖子评论失败:', error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};

//+++++++++++++++++++++++++++++++++++++++++
exports.createPost = async (ctx, next) => {
  const t = await sequelize.transaction();
  try {
    const { user_id, title, content, song_id, images } = ctx.request.body;

    if (!user_id || !content) {
      ctx.body = { code: 400, success: false, message: '用户ID和内容为必填项' };
      // ★ 确保在回滚前，事务已经被创建
      if (t) await t.rollback();
      return;
    }

    // ★ 1. 准备要插入 post 表的数据对象
    const postData = {
      user_id,
      title: title || null, // 如果 title 不存在，则设为 null
      content,
      // ★ 2. 核心修正：明确处理 song_id
      //    只有当 song_id 存在且是一个有效值时，才将其加入插入对象
      song_id: song_id || null
    };

    console.log('[Backend] 准备插入 Post 数据:', postData);

    const newPost = await Post.create(postData, { transaction: t });

    if (images && Array.isArray(images) && images.length > 0) {
      const imageRecords = images.map((url, index) => ({
        post_id: newPost.id,
        image_url: url,
        order_index: index
      }));

      console.log('[Backend] 准备插入 PostImage 数据:', imageRecords);
      await PostImage.bulkCreate(imageRecords, { transaction: t });
    }

    await t.commit();
    ctx.body = { code: 201, success: true, message: '发布成功', data: newPost };

  } catch (error) {
    // ★ 确保在回滚前，事务已经被创建
    if (t) await t.rollback();
    // ★ 打印更详细的错误日志
    console.error('创建帖子时发生严重错误:', error);
    ctx.body = { code: 500, success: false, message: '服务器内部错误' };
  }
};

exports.addPostComment = async (ctx, next) => {
  try {
    // 从请求体中获取必要的数据
    const { post_id, user_id, content } = ctx.request.body;

    // 数据验证
    if (!post_id || !user_id || !content || !content.trim()) {
      ctx.body = { code: 400, success: false, message: '参数不完整或评论内容为空' };
      return;
    }

    // 创建新评论
    const newComment = await PostComment.create({
      post_id,
      user_id,
      content
    });

    // (推荐) 返回完整的新评论数据，以便前端直接使用
    // 您可以根据需要 include 用户信息
    const fullNewComment = await PostComment.findByPk(newComment.id, {
      include: [{
        model: model.consumer, // 假设用户模型叫 consumer
        as: 'author',
        attributes: ['username', 'avatar']
      }]
    });


    ctx.body = { code: 201, success: true, message: '评论成功', data: fullNewComment };

  } catch (error) {
    console.error('发布评论时发生错误:', error);
    ctx.body = { code: 500, success: false, message: '服务器错误' };
  }
};

///////////////////////////////////////////////////////
// 【新增】更新歌单信息 (标题、封面、简介、风格)
exports.updateSongList = async (ctx, next) => {
  // 1. 获取参数
  // 从URL路径中获取歌单ID
  const { id } = ctx.params; 
  // 从请求体中获取要更新的数据
  const { title, pic, introduction, style } = ctx.request.body;
  // ★ 在真实项目中，creator_id 应该从JWT Token中解析得到，这里我们先写死以测试
  const creator_id = 1; 

  // 2. 参数校验
  if (!id) {
    ctx.status = 400;
    ctx.body = { code: 400, message: '缺少歌单ID' };
    return;
  }

  try {
    // 3. 查找歌单并验证权限
    // 关键一步：必须确保要修改的歌单存在，并且其创建者是当前操作的用户
    const songListToUpdate = await SongList.findOne({
      where: {
        id: id,
        //creator_id: creator_id // 权限校验
      }
    });

    // 如果找不到，说明歌单不存在或用户无权修改
    if (!songListToUpdate) {
      ctx.status = 404; // 或 403 Forbidden
      ctx.body = { code: 404, message: '歌单不存在或无权修改' };
      return;
    }

    // 4. 准备要更新的数据
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (pic !== undefined) updateData.pic = pic;
    if (introduction !== undefined) updateData.introduction = introduction;
    if (style !== undefined) updateData.style = style;
    
    // 如果没有任何要更新的字段，可以直接返回
    if (Object.keys(updateData).length === 0) {
        ctx.body = { code: 200, message: '没有需要更新的内容', data: songListToUpdate };
        return;
    }

    // 5. 执行更新操作
    await songListToUpdate.update(updateData);
    
    // 6. 返回成功响应
    // 返回更新后的完整歌单信息，以便前端直接使用
    ctx.body = {
      code: 200,
      message: '歌单更新成功',
      data: songListToUpdate 
    };

  } catch (error) {
    console.error(`更新歌单ID ${id} 失败:`, error);
    ctx.status = 500;
    ctx.body = { code: 500, message: '服务器内部错误' };
  }
};

exports.getSongListsByStyle = async (ctx, next) => {
  // 1. 从前端的请求中获取 'style' 参数 (e.g., ?style=说唱)
  const { style, page = 1, pageSize = 5 } = ctx.query; // 顺便加上分页功能

  console.log(`[DEBUG] 正在查询风格为: "${style}" 的歌单`);
  // 2. 参数校验
  if (!style) {
      ctx.body = { code: 400, message: '曲风(style)参数不能为空' };
      return;
  }

  try {
      // 3. 调用 Sequelize 的 findAndCountAll 方法进行数据库查询
      // 使用 findAndCountAll 可以同时获得总数和当前页的数据，方便前端做分页
      const { count, rows } = await SongList.findAndCountAll({
          where: {
              style: {
                  [Op.eq]: style // 使用 Op.eq 进行精确匹配
              }
          },
          limit: parseInt(pageSize),
          offset: (parseInt(page) - 1) * parseInt(pageSize),
          order: [['id', 'DESC']] // 按ID降序，让最新的歌单排在前面
      });

      // 4. 返回成功响应
      ctx.body = {
          code: 200,
          message: `获取风格 [${style}] 的歌单成功`,
          data: {
              total: count,
              list: rows
          }
      };

  } catch (error) {
      console.error(`根据风格 [${style}] 获取歌单失败:`, error);
      ctx.body = { code: 500, message: '服务器内部错误' };
  }
};