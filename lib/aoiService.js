var towerAOI = require('./towerAOI/towerAOI');
exp = module.exports;

/**
 * AOI Service interface
 * @param config {Object} aoi config
 */
//aoi服务。area直接new这个服务类，这个AOIService只有一个属性：this.aoi
var AOIService = function(config){
  //如果参数有aoi这个属性（然而area实例aoi时提供的参数没有aoi属性）
  if(!!config.aoi){
    this.aoi = config.aoi.getService(config);
  //所有area实例aoi用的是下面的aoi
  }else{
    this.aoi = towerAOI.getService(config);
  }
}

var pro = AOIService.prototype;

/**
 * Get all object ids by given pos and range
 * @param pos {Object} {x: x pos, y: y pos}
 * @param range {Number} the range to find
 * @return {Array} the object ids
 */
//通过 坐标，获取对象id组
pro.getIdsByPos = function(pos, range){
  return this.aoi.getIdsByPos(pos, range);
}

/**
 * Get all boject ids by given pos , range , types
 * @param pos {Object} {x: x pos, y: y pos} The pos of the object
 * @param types {Array} The object types need to find
 * @param range {Number} the range to find ids
 */
pro.getIdsByRange = function(pos, range, types){
  return this.aoi.getIdsByRange(pos, range, types);
}

/**
 * Add object to aoi module
 * @param obj {Object}
 * @param pos {Object} {x: x pos, y: y pos} The pos of the object
 * @return {Boolean} add object result
 */
pro.addObject = function(obj, pos){
  return this.aoi.addObject(obj, pos);
}

/**
 * Remove object from aoi module
 * @param obj {Object}
 * @param pos {Object} {x: x pos, y: y pos} The pos of the object
 * @return {Boolean} add object result
 */
pro.removeObject = function(obj, pos){
  return this.aoi.removeObject(obj, pos);
}

/**
 * Update object in aoi module
 * @param obj {Object}
 * @param pos {Object} {x: x pos, y: y pos} The pos of the object
 * @return {Boolean} add object result
 */
pro.updateObject = function(obj, oldPos, newPos){
  return this.aoi.updateObject(obj, oldPos, newPos); 
}

/**
 * Get watchers for given types
 */
pro.getWatchers = function(pos, types){
	return this.aoi.getWatchers(pos, types);
}

/**
 * Add watcher to aoi module
 */
pro.addWatcher = function(watcher, pos, range){
	return this.aoi.addWatcher(watcher, pos, range);
}

/**
 * remove watcher for pos and range
 */
pro.removeWatcher = function(watcher, pos, range){
	return this.aoi.removeWatcher(watcher, pos, range);
}

/**
 * update watcher
 */
pro.updateWatcher = function(watcher, oldPos, newPos, oldRange, newRange){
	return this.aoi.updateWatcher(watcher, oldPos, newPos, oldRange, newRange);
}

/**
 * get aoi service
 */
exp.getService = function(config){
  return new AOIService(config);
}
