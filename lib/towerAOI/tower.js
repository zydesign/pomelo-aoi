var EventEmitter = require('events').EventEmitter;
var exp = module.exports;

//灯塔实体，属性有：对象id组，观察者id组，对象id图阵，对象数量
var Tower = function(){
  this.ids = {};//储存对象们的id
  this.watchers = {}; //储存各种观察者的类型的id集合{player：{id1，id2...}; mod：{id1，id2...}...}
  this.typeMap = {};//储存各种对象的类型的id集合{player：{id1，id2...}; mod：{id1，id2...}...}
  
  this.size = 0;//显示灯塔内的对象数量
}

var pro = Tower.prototype;

/**
 * Add an object to tower
 * 加入一个对象到灯塔里,添加到ids，typeMap，size
 */
//添加对象到灯塔。角色id加入该灯塔的对象id组，对象id图阵，对象数量size加1 （参数obj为{id : entity.entityId, type : entity.type}）
//如果添加成功，返回true
pro.add = function(obj){
  var id = obj.id;
  var type = obj.type;
    	
  this.ids[id] = id;
  
  if(!!obj.type){
    this.typeMap[type] = this.typeMap[type]||{};
	  //如果图阵添加了该角色id，返回false
    if(this.typeMap[type][id] === id)
    	return false;
    	
    this.typeMap[type][id] = id;
    this.size++;
    return true;
  }else{
  	return false;
  }
};

/**
 * Add watcher to tower
 * 增加观察者到灯塔内
 */
//添加观察者角色id到灯塔的观察者组，无返回值
pro.addWatcher = function(watcher){
	var type = watcher.type;
	var id = watcher.id;
	
	if(!!type){
		this.watchers[type] = this.watchers[type]||{};
		this.watchers[type][id] = id;
	}
};

/**
 * Remove watcher from tower
 * 移除灯塔内的一个观察者
 */
//从观察者组中移除观察者
pro.removeWatcher = function(watcher){
	var type = watcher.type;
	var id = watcher.id;
	
	if(!!type && !!this.watchers[type]){
		delete this.watchers[type][id];
	}
};

/**
 * Get all watchers by the given types in this tower
 * 获取灯塔内指定类型的观察者
 */
//获取指定类观察者组，遍历参数类型组，返回N种类型的观察者图阵
pro.getWatchers = function(types){
	var result = {};
	
	if(!!types && types.length > 0){
		for(var i = 0; i < types.length; i++){
			var type = types[i];
			if(!!this.watchers[type]){
				result[type] = this.watchers[type];
			} 
		}
	}
	
	return result;
};

/**
 * Remove an object from this tower
 * 移除灯塔内的一个对象
 */
//删除对象id组中的角色id，删除图阵中的角色id
pro.remove = function(obj){
  var id = obj.id;
  var type = obj.type;
  
  if(!!this.ids[id]){
    delete this.ids[id];
    
    if(!!type)
      delete this.typeMap[type][id];
    this.size--;
  }
};

/**
 * Get all object ids in this tower
 * 获取灯塔内的所有对象id
 */
pro.getIds = function(){
  return this.ids;
}

/**
 * Get object ids of given types in this tower
 *  在所在的灯塔点中，获取指定类型的所有id
 */
////获取指定类对象id组，遍历参数类型组，从对象图阵中返回N种类型的对象id组，返回值为  对象图阵
pro.getIdsByTypes = function(types){
  var result = {};
  for(var i = 0; i < types.length; i++){
    var type = types[i];
    if(!!this.typeMap[type])
      result[type] = this.typeMap[type];
  }
  
  return result;
};

/**
 * Create a new tower
 */
exp.create = function(){
  return new Tower();
};

