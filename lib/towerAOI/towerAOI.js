var Tower = require('./tower');
var exp = module.exports;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

//灯塔管理类

//area实例aoi服务，用的是new TowerAOI(config)-----（config用的是area配置表的其中某个场景数据）
var TowerAOI = function(config){
  this.width = config.width;      //地图宽度，单位为像素
  this.height = config.height;    //地图高度，单位为像素

  this.towerWidth = config.towerWidth;      //灯塔宽度，单位为像素
  this.towerHeight = config.towerHeight;    //灯塔高度，单位为像素

  this.towers = {};                         //灯塔组 ，init初始化时生成子灯塔实体

  this.rangeLimit = 5 || config.limit;      //灯塔范围限制

  this.init();
};

//让TowerAOI继承 EventEmitter.prototype原型。
util.inherits(TowerAOI, EventEmitter);

var pro = TowerAOI.prototype;

//初始化是根据地图大小和灯塔大小，计算max灯塔点，生成灯塔（area实例aoi服务时，立即执行init函数）------------------------1
pro.init = function(){
	//计算得到灯塔列阵【max灯塔点】（不是坐标），即灯塔组右下角的灯塔点。左上为原点灯塔点为{0,0}
  this.max = {
    x: Math.ceil(this.width/this.towerWidth) - 1, //Math.ceil()舍入小数，返回值大于自身
    y: Math.ceil(this.height/this.towerHeight) - 1
  };

	//给每个灯塔点设置灯塔实体，并加入灯塔组（灯塔点就是灯塔组的key）
	for(var i = 0; i<Math.ceil(this.width/this.towerWidth); i++){
		this.towers[i] = {};
		for(var j = 0; j < Math.ceil(this.height/this.towerHeight); j++){
      this.towers[i][j] = Tower.create();
   }
 }
};

/**
 * Get given type object ids from tower aoi by range and types
 * 通过灯塔aoi的范围和对象的类型获取对象各个类型的id数组{[],[],[]...}
 * @param pos {Object} The pos to find objects 
 *  指定的坐标
 * @param range {Number} The range to find the object, in tower aoi, it means the tower number from the pos  
 *  指定的灯塔范围，就是指定对象坐标所在的灯塔为中心的上下左右灯塔数
 * @param types {Array} The types of the object need to find 
 *  需要被搜索的对象的类型
 */

//通过指定的坐标、灯塔范围、对象类型组，【获取指定范围的指定类型的实体id图阵】, 单例是result[type][id] = entityId------------------对象组
pro.getIdsByRange = function(pos, range, types){
   //如果坐标不合法，或范围不合法，返回空数组
  if(!this.checkPos(pos) || range < 0 || range > this.rangeLimit)
    return [];

  var result = {};
  var p = this.transPos(pos); //通过对象的坐标，算出的对应的【灯塔点】
	
  //指定灯塔点范围极限，是指定灯塔点所在的范围左上和右下两个边缘灯塔点{start: start, end :end}
  var limit = getPosLimit(p, range, this.max);

  //console.error('get Ids p : %j, range : %j limit : %j, max : %j', p, range, limit, this.max);
  //遍历灯塔点所在的范围图阵，返回该范围的对象id图阵，
  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      result = addMapByTypes(result, this.towers[i][j].getIdsByTypes(types), types);
    }
  }
  return result;
};

/**
 * Get all object ids from tower aoi by pos and range
 * 通过指定坐标、灯塔范围，【获取范围内的每一个灯塔的所有对象id】（不指定类型，是所有类型），每一个元素为一个灯塔点的ids---------------对象数组
 */
pro.getIdsByPos = function(pos, range){
   //如果坐标不合法，或范围小于零，返回空数组
  if(!this.checkPos(pos) || range < 0)
    return [];

  var result = [];
  range = range>5?5:range;  //现在范围range在5以内

  var p = this.transPos(pos); //坐标转换为灯塔点
  var limit = getPosLimit(p, range, this.max);  //算出灯塔范围对角线端的2灯塔{start: start, end :end}

  //console.error('get Ids p : %j, range : %j limit : %j, max : %j', p, range, limit, this.max);
  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      result = addMap(result, this.towers[i][j].getIds());
    }
  }
  return result;
};

/**
 * Add an object to tower aoi at given pos
 *通过对象的实体id和坐标，让对应的灯塔点添加对象的实体id，并aoi发射‘add’事件-----------------------------------------add事件
 */
pro.addObject = function(obj, pos){
    //如果实际坐标合法
  if(this.checkPos(pos)){
    var p = this.transPos(pos);       //转换坐标为灯塔点
    this.towers[p.x][p.y].add(obj);   //角色实体id添加到指定灯塔的ids组，对象图阵typeMap组中，数量size加1
	  
    //aoi发射‘add’事件，（场景area开启就注册了aoiEventManager.addEvent(area, aoi)的事件监听）..................................
    this.emit('add', {id: obj.id, type:obj.type, watchers:this.towers[p.x][p.y].watchers});
    return true;
  }

  return false;
};

/**
 * Remove object from aoi module
 * 通过对象的实体id和坐标，删除对应灯塔点的对象的实体id，并aoi发射‘remove’事件----------------------------------------remove事件
 */
pro.removeObject = function(obj, pos){
  if(this.checkPos(pos)){
    var p = this.transPos(pos);
    this.towers[p.x][p.y].remove(obj);  //指定灯塔点，删除该灯塔的指定实体id
    this.emit('remove', {id: obj.id, type:obj.type, watchers:this.towers[p.x][p.y].watchers});
    return true;
  }

  return false;
};

//通过对象实体id和新旧坐标，获取新旧灯塔点，然后oldTower.remove(obj);   newTower.add(obj);并aoi发射‘update’事件--------update事件
//【move动作发起更新对象，让Timer.updateObject调用该函数】
pro.updateObject = function(obj, oldPos, newPos){
	//检查新旧坐标是否合法
  if(!this.checkPos(oldPos) || !this.checkPos(newPos))
    return false;

	//新旧坐标转换为新旧灯塔点
  var p1 = this.transPos(oldPos);
  var p2 = this.transPos(newPos);

	//如果新旧灯塔点相同，不必update，返回true
  if(p1.x===p2.x && p1.y===p2.y)
    return true;
  else{
	  //如果获取不到灯塔，直接返回
  	if(!this.towers[p1.x] || !this.towers[p2.x]){
  		console.error('AOI pos error ! oldPos : %j, newPos : %j, p1 : %j, p2 : %j', oldPos, newPos, p1, p2);
  		console.trace();
  		return;
  	}
	  //获取对应的新旧灯塔
		var oldTower = this.towers[p1.x][p1.y];
		var newTower = this.towers[p2.x][p2.y];

	  //执行旧灯塔删除对象的实体id，新灯塔添加对象的实体id
		oldTower.remove(obj);
		newTower.add(obj);

	  //发射update事件，广播消息，让新旧观察者看到和看不到实体（实体移动了）................................
		this.emit('update', {id: obj.id, type:obj.type, oldWatchers:oldTower.watchers, newWatchers:newTower.watchers})
  }
};


/**
 * Check if the pos is valid;
 *检测对象坐标是否合法，地图内部为合法，返回true或false
 * @return {Boolean} Test result
 */
pro.checkPos = function(pos){
  if(!pos)
    return false;
  if(pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height)
    return false;
  return true;
};

/**
 * Trans the absolut pos to tower pos. For example : (210, 110} -> (1, 0), for tower width 200, height 200
 *通过实际坐标计算出该位置的灯塔点（checkPos限制了坐标不会超出地图宽高，也不能等于地图宽高，所以能获取准确的灯塔点）
 */
pro.transPos = function(pos){
  return {
    x : Math.floor(pos.x/this.towerWidth),//Math.floor()舍弃小数，返回小于自身的整数
    y : Math.floor(pos.y/this.towerHeight)
  };
};

//watcher为对象，range所在灯塔的灯塔范围，通过坐标获取灯塔点及对应的灯塔范围，让灯塔范围里面的所有灯塔添加自己为观察者
pro.addWatcher = function(watcher, pos, range){
	if(range < 0)
		return;

	range = range > 5?5:range;    //限制灯塔范围在5内
	var p = this.transPos(pos);   //转换坐标为灯塔点
	var limit = getPosLimit(p, range, this.max);   //获取指定灯塔点范围的极限灯塔点{start: start, end :end}

	//获取灯塔范围的所有灯塔，执行添加观察者
  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      this.towers[i][j].addWatcher(watcher);
    }
  }
};

//通过坐标，和灯塔范围，获取灯塔范围内的所有灯塔，删除自己这个观察者
pro.removeWatcher = function(watcher, pos, range){
	if(range < 0)
		return;

	range = range > 5?5:range;

	var p = this.transPos(pos);
	var limit = getPosLimit(p, range, this.max);

  for(var i = limit.start.x; i <= limit.end.x; i++){
    for(var j = limit.start.y; j <= limit.end.y; j++){
      this.towers[i][j].removeWatcher(watcher);
    }
  }
};

//更新观察者，通过新旧坐标算出的灯塔范围交集，让删除塔删除观察者，让增加塔组增加观察者-----------------------'updateWatcher'事件
//【move动作发起，让timer.updateWatcher更新观察者，并且推送消息给移动的自己，要删除的可视实体，和增加的可视实体】
pro.updateWatcher = function(watcher, oldPos, newPos, oldRange, newRange){
	//先要保证新旧坐标合法，在地图内，如果不合法返回false
  if(!this.checkPos(oldPos) || !this.checkPos(newPos))
    return false;

	//新旧坐标转换为灯塔点
  var p1 = this.transPos(oldPos);
  var p2 = this.transPos(newPos);

	//如果新旧坐标相同，不需要更新，返回true
  if(p1.x===p2.x && p1.y===p2.y && oldRange===newRange)
    return true;
  else{
	  //检查新旧范围是否合法
    if(oldRange < 0 || newRange < 0){
      return false;
    }

	  //保证新旧范围在5内
    oldRange = oldRange>5?5:oldRange;
    newRange = newRange>5?5:newRange;

	  //计算发生变化的新旧灯塔组
    var changedTowers = getChangedTowers(p1, p2, oldRange, newRange, this.towers, this.max);
	  
	  //删除塔（需要删除观察者的灯塔组）
    var removeTowers = changedTowers.removeTowers;
	  //添加塔（需要添加观察者的灯塔组）
    var addTowers = changedTowers.addTowers;
    var addObjs = [];     //添加塔中的id数组[id,id,id...]  （作为新观察者，将看到这些对象）
    var removeObjs = [];  //删除塔中的id数组[id,id,id...]  （作为被删除的观察者，将看不到这些对象）

    var i, ids;
	  //遍历添加塔，让添加塔的所有灯塔添加移动角色的观察者id
    for(i = 0; i < addTowers.length; i++){
      addTowers[i].addWatcher(watcher);
      ids = addTowers[i].getIds();
      addMap(addObjs, ids);
    }

	  //遍历删除塔，让删除塔的所有灯塔删除移动角色的观察者id
    for(i = 0; i < removeTowers.length; i++){
      removeTowers[i].removeWatcher(watcher);
      ids = removeTowers[i].getIds();
      addMap(removeObjs, ids);
     }

     //发射'updateWatcher'事件。推送消息给自己，即将看不见的对象removeObjs，和即将看见addObjs（会先转换成实体）。
     //（玩家移动会更新周围的可视对象）................................................................................
    this.emit('updateWatcher', {id: watcher.id, type:watcher.type, addObjs: addObjs, removeObjs:removeObjs});
    return true;
  }
};

/**
 * Get changed towers for girven pos
 * @param p1 {Object} The origin position
 * @param p2 {Object} The now position
 * @param r1 {Number} The old range
 * @param r2 {Number} The new range
 * @param towers {Object} All towers of the aoi
 * @param max {Object} The position limit of the towers
 *
 */
//计算发生变化的新旧灯塔组
function getChangedTowers(p1, p2, r1, r2, towers, max){
  var limit1 = getPosLimit(p1, r1, max);    //旧灯塔点获取的灯塔范围极限
  var limit2 = getPosLimit(p2, r2, max);    //新灯塔点获取的灯塔范围极限
  var removeTowers = [];      //实体移动后，需要被删除观察者的灯塔数组
  var addTowers = [];         //实体移动后，需要添加该观察者的灯塔数组
  var unChangeTowers = [];    //实体移动后，观察者没有发生改变的灯塔数组

	//遍历旧范围灯塔阵
  for(var x = limit1.start.x; x <= limit1.end.x; x++){
  	for(var y = limit1.start.y; y <= limit1.end.y; y++){
		//如果旧灯塔点在新旧范围的交集里，则该部分灯塔点观察者不变
  		if(isInRect({x: x, y : y}, limit2.start, limit2.end)){
  			unChangeTowers.push(towers[x][y]);
  		}else{
			//如果旧灯塔点不在新旧范围的交集里，则该部分灯塔点要删除观察者，加入删除组
  			removeTowers.push(towers[x][y]);
  		}
  	}
  }

	//遍历新范围灯塔阵
  for(var x = limit2.start.x; x <= limit2.end.x; x++){
  	for(var y = limit2.start.y; y <= limit2.end.y; y++){
		//如果新灯塔点不在新旧范围的交集里，则该部分灯塔点要添加观察者，加入添加组
  		if(!isInRect({x: x, y : y}, limit1.start, limit1.end)){
  			addTowers.push(towers[x][y]);
  		}
  	}
  }

	//返回对象：添加组，删除组，不变组
  return {addTowers:addTowers, removeTowers: removeTowers, unChangeTowers: unChangeTowers};
}

/**
 * Get the postion limit of given range
 * @param pos {Object} The center position
 *  这里的pos是灯塔点，并以这个点为中心加减range
 * @param range {Number} The range
 *  range为一个正整数，是pos上下左右的限制值,被限制在0 < range < 5
 * @param max {max} The limit, the result will not exceed the limit
 * @return The pos limitition
 *  返回的是一个对象，是指定灯塔点所在的范围左上和右下两个边缘灯塔点{start: start, end :end}。
 */
function getPosLimit(pos, range, max){
	var result = {};
	var start = {}, end = {};

	//限制灯塔点获取的范围点都在地图灯塔图阵上
	if(pos.x - range < 0){
		start.x = 0;
		end.x = 2*range;
	}else if(pos.x + range > max.x){
		end.x = max.x;
		start.x = max.x - 2*range;
	}else{
		start.x = pos.x - range;
		end.x = pos.x + range;
	}

	if(pos.y - range < 0){
		start.y = 0;
		end.y = 2*range;
	}else if(pos.y + range > max.y){
		end.y = max.y;
		start.y = max.y - 2*range;
	}else{
		start.y = pos.y - range;
		end.y = pos.y + range;
	}

	start.x = start.x>=0?start.x:0;
	end.x = end.x<=max.x?end.x:max.x;
	start.y = start.y>=0?start.y:0;
	end.y = end.y<=max.y?end.y:max.y;

	return {start: start, end :end};
}

/**
 * Check if the pos is in the rect
 *判断点是否在矩形内
 */
function isInRect(pos, start, end){
	return (pos.x >= start.x && pos.x <= end.x && pos.y >= start.y && pos.y <= end.y);
}

pro.getWatchers = function(pos, types){
	if(this.checkPos(pos)){
    var p = this.transPos(pos);
    return this.towers[p.x][p.y].getWatchers(types);
  }

  return null;
};

/**
 * Combine map to arr
 * @param arr {Array} The array to add the map to
 * @param map {Map} The map to add to array
 */
//将图阵的对象，一个一个加入数组
function addMap(arr, map){
  for(var key in map)
    arr.push(map[key]);
  return arr;
}

/**
 * Add map to array by type
 * 在灯塔中按类型对象集储存的对象id集中，通过指定类型集，返回一个新的类型集对象id数组
 */
function addMapByTypes(result, map, types){
  for(var i = 0; i < types.length; i++){
    var type = types[i];

    if(!map[type])
      continue;

    if(!result[type]){
      result[type] = [];
    }
    for(var key in map[type]){
      result[type].push(map[type][key]);
    }
  }
  return result; //这个result[type]是数组，这里的id是有序排列的，所以result的每一个type都是有序的id集合
}

exp.getService = function(config){
  return new TowerAOI(config);
};
