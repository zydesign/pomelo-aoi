# pomelo-aoi

##安装aoi模块
```
npm install pomelo-aoi
```

##使用方式
``` javascript
//先开启aoi服务，这个服务是aoi工厂函数的一个实例
var aoiManager = require('pomelo-aoi');
var config = {
	map : {
		width : 3200,
		height : 2400
	},
	tower : {
		width : 300,
		height : 300
	}
}

var aoi = qoiManager.getService(config);
```

##开启aoi服务后，可以使用相关api
``` javascript
	//Add object 
	aoi.addObject(obj, pos);
	
	//Remove object 
	aoi.removeObject(obj, pos);
	
	//Update object
	aoi.updateObject(obj, oldPos, newPos);
	
	//Add watcher 
	aoi.addWatcher(watcher, pos, range);
	
	//Remove watcher
	aoi.removeWatcher(watcher, pos, range0;
	
	//updateWatcher(watcher, oldPos, newPos, oldRange, newRange);
``` 

所有api都在aoiservice.js脚本里面，aoiservice的方法都添加了事件发射器，只要注册了监听事件，调用函数即会触发事件

##aoi继承了事件分发器，先监听各个事件，当对象或观察者的状态发生变化时，触发aoi事件:
``` javascript
	aoi.on('add', function(params){
		//Handle add event
	});

``` 
aoi灯塔事件通过'add', 'remove', 'update' 监听所有aoi灯塔对象,通过“updateWatcher”更新观察家。

