function initStorageManager() {

	logToConsole("StorageManager:init開始");

	var storage = window.localStorage;
	
	var KEY_APPCONFIG     = "appConfig";
	var KEY_FORMLIST      = "formList";
	var KEY_SOBJECTLIST   = "sobjectList";
	var KEY_DESCRIBELIST  = "describelist";
	var KEY_DESCRIBEDATA  = "describedata_";
	var KEY_FORMDATA      = "formdata_";
	
	var StorageManager = {
		
		FORM_SLOT_MAX:10,
		DESCRIBE_SLOT_MAX:10,
		
		loadApplicationConfig:function(success , fail){
			var res = null;
			try{
				res = storage.getItem( KEY_APPCONFIG );
			}catch( e){
				fail(e);
				return;
			}
			success(res);
		},
		saveApplicationConfig:function(appConfig, success , fail){
			try{
				storage.setItem( KEY_APPCONFIG , appConfig);
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeApplicationConfig:function( success , fail){
			try{
				storage.removeItem( KEY_APPCONFIG );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		loadFormList:function( success , fail){
			var res = null;
			try{
				res = storage.getItem( KEY_FORMLIST );
			}catch( e){
				fail(e);
				return;
			}
			success(res);
		},
		saveFormList:function(formList, success , fail){
			try{
				storage.setItem(KEY_FORMLIST , formList);
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeFormList:function( success , fail){
			try{
				storage.removeItem( KEY_FORMLIST );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		loadSObjectList:function( success , fail){
			var res = null;
			try{
				res = storage.getItem( KEY_SOBJECTLIST );
			}catch( e){
				fail(e);
				return;
			}
			success(res);
		},
		saveSObjectList:function(sobjectList, success , fail){
			try{
				storage.setItem(KEY_SOBJECTLIST , sobjectList);
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeSObjectList:function(success , fail){
			try{
				storage.removeItem( KEY_SOBJECTLIST );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		
		loadDescribeList:function( success , fail){
			var res = null;
			try{
				res = storage.getItem( KEY_DESCRIBELIST );
			}catch( e){
				fail(e);
				return;
			}
			success(res);
		},
		saveDescribeList:function( describeList, success , fail){
			try{
				storage.setItem(KEY_DESCRIBELIST , describeList );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeDescribeList:function(success , fail){
			try{
				storage.removeItem( KEY_DESCRIBELIST );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		
		loadDescribeData:function( slotId , success , fail){
			var res = null;
			try{
				res = storage.getItem( KEY_DESCRIBEDATA + slotId );
			}catch( e){
				fail(e);
				return;
			}
			success(res);
		},
		saveDescribeData:function( describeData, slotId , success , fail){
			try{
				storage.setItem(KEY_DESCRIBEDATA + slotId , describeData );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeDescribeData:function(slotId , success , fail){
			try{
				storage.removeItem( KEY_DESCRIBEDATA + slotId );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeAllDescribeData:function( success , fail){
			try{
				for(var i = 0 ; i< this.DESCRIBE_SLOT_MAX; i++){
					storage.removeItem( KEY_DESCRIBEDATA + (i+1) );
				}
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		
		loadFormData:function( slotId , success , fail){
			var res = null;
			try{
				res = storage.getItem( KEY_FORMDATA + slotId );
			}catch( e){
				fail(e);
				return;
			}
			success(res);
		},
		saveFormData:function( formData, slotId , success , fail){
			try{
				storage.setItem(KEY_FORMDATA + slotId , formData );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeFormData:function(slotId , success , fail){
			try{
				storage.removeItem( KEY_FORMDATA + slotId );
			}catch( e){
				fail(e);
				return;
			}
			success();
		},
		removeAllFormData:function( success , fail){
			try{
				for(var i = 0 ; i< this.FORM_SLOT_MAX; i++){
					storage.removeItem( KEY_FORMDATA + (i+1) );
				}
			}catch( e){
				fail(e);
				return;
			}
			success();
		}
		
	};
	
	this.AppStorageManager = StorageManager;
	
	logToConsole("StorageManager:init完了");
}
