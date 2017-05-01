var EventEmitter = require('events').EventEmitter;
var exp = module.exports;

var Tower = function(){
  this.ids = {};//储存对象们的id
  this.watchers = {}; //储存各种观察者的类型的id集合{player：{id1，id2...}，mod：{id1，id2...}...}
  this.typeMap = {};//储存各种对象的类型的id集合{player：{id1，id2...}，{mod：{id1，id2...}...}
  
  this.size = 0;//显示灯塔内的对象数量
}

var pro = Tower.prototype;

/**
 * Add an object to tower
 * 加入一个对象到灯塔里
 */
pro.add = function(obj){
  var id = obj.id;
  var type = obj.type;
    	
  this.ids[id] = id;
  
  if(!!obj.type){
    this.typeMap[type] = this.typeMap[type]||{};
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
 *  在所在的灯塔点中，通过类型获取对象们的id
 */
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

