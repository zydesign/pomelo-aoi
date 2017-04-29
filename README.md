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

##Use the aoi service
The aoi instace has the basic interface for aoi action.

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
More api can be find in aoiService.js.
所有api都在aoiservice.js脚本里面

##Handle aoi event
The aoi service will generate event when the status of objects or watchers changes. You can handler these event :
``` javascript
	aoi.on('add', function(params){
		//Handle add event
	});

``` 
The event of tower aoi are: 'add', 'remove', 'update' for aoi object, and 'updateWatcher' for watcher.
Of course you can ignore all these events without do any effect to aoi function. 
