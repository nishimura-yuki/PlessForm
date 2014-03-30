function initAppData( ) {

	logToConsole("AppData:init開始");
	
	var AppData = {
		initialized:false,
		loginUserId:"" ,
		loginUserName:"" , 
		appPassword:"" ,
		usePassword:false ,
		
		init:function( success , error ){
			if(!this.initialized){
				var initSuccess = function(){
					this.initialized = true;
					success();
				}
				this.load( initSuccess , error );
			}else{
				success();
			}
		},
		reset:function(){
			this.resetData();
			this.initialized = false;
		},
		load:function( success , error ){
			var _this = this;
			var loadSuccess = function(res){
				if(res != null){
					var tmpJson = JSON.parse(res);
					_this.loginUserId = tmpJson.loginUserId;
					_this.appPassword = tmpJson.appPassword;
					_this.loginUserName = tmpJson.loginUserName;
					_this.usePassword = tmpJson.usePassword;
				}else{
					_this.resetData();
				}
				success();
			}
			//ローカルストレージから取得
			AppStorageManager.loadApplicationConfig(loadSuccess , error);
		},
		
		resetData:function(){
			this.loginUserName = "";
			this.loginUserId = "";
			this.appPassword = "";
			this.usePassword = false;
		},
		
		setUserId:function(userId){
			this.loginUserId = userId;
		},
		setUserName:function(userName){
			this.loginUserName = userName;
		},
		setAppPassword:function(pw){
			this.appPassword = pw;
			this.usePassword = true;
		},
		
		getUserId:function(){
			return this.loginUserId;
		},
		getUserName:function(){
			return this.loginUserName;
		},
		getAppPassword:function(){
			return this.appPassword;
		},
		disablePassword:function(){
			this.setAppPassword("");
			this.usePassword = false;
		},
		isEnablePassword:function(){
			return this.usePassword;
		},

		saveConfig:function( success , error ){
			AppStorageManager.saveApplicationConfig(this.toJsonStr() , success , error );
		},	
		toJsonStr:function(){
			var j = {};
			j.loginUserId = this.getUserId();
			j.appPassword = this.getAppPassword();
			j.loginUserName = this.getUserName();
			j.usePassword = this.isEnablePassword();
			return JSON.stringify(j);
		}
	};
	
	var SObjectListData = {
		initialized:false,
		//1行のデータ例
		//{"Name":"Lead","Label":"リード"}
		list:[],
		init:function(success , error){
			if(!this.initialized){
				var initSuccess = function(){
					this.initialized = true;
					success();
				}
				this.load(initSuccess , error);
			}else{
				success();
			}
		},
		reset:function(){
			this.list = [];
			this.initialized = false;
		},
		load:function(success , error){
			this.list = [];
			var _this = this;
			logToConsole("load実行 : ");
			
			var loadSuccess = function(res){
				 
				logToConsole(typeof(res) + "  読み込み成功 : " + res);
				if(res == null){
					forcetkClient.describeGlobal( connectSuccess , connectError);
				}else{
					_this.list = JSON.parse(res);
					success();
				}
			}
			
			var loadError = function(e){
				logToConsole("読み込み失敗 : " + e);
				error(e);
			}
			
			var connectSuccess = function(result){
				
				//サーバから取得したデータをアプリ用に変換
				_this.list = convertSObjectList(result);
				
				//ソートしておく
				_this.list = _.sortBy(_this.list, function (s) { 
				    return (s.Label + s.Name); 
				});
				
				//取得したデータをローカルにも保存しておく
				AppStorageManager.saveSObjectList(_this.toJsonArrayString() , success , success );
				
			}
			var connectError = function(e){
				logToConsole(JSON.stringify(e));
				error(e);
			}
			
			//まずはローカルから取得
			AppStorageManager.loadSObjectList(loadSuccess , loadError);
			
		},
		getList:function(){
			return this.list;
		},
		remove:function(success , error){
			var _this = this;
			var removeSuccess = function(res){
				_this.reset();
				success();
			}
			AppStorageManager.removeSObjectList(removeSuccess , error );
		},
		toJsonArrayString:function(){
			var tmp = JSON.stringify( this.list );
			logToConsole("sobject list : " + tmp);
			return tmp;
		}
		
	}
	
	var FormListData = {
		MAX_DATA_NUM:AppStorageManager.FORM_SLOT_MAX,
		initialized:false,
		// 1行のデータ例
		//{slotId:2 ,name:"テスト2っす",sobject:"Contact"}
		list:[],
		slotMap:{},
		init:function(success , error){
			if(!this.initialized){
				var initSuccess = function(){
					this.initialized = true;
					success();
				}
				this.load(initSuccess , error);
			}else{
				success();
			}
		},
		reset:function(){
			this.list = [];
			this.slotMap = {};
			this.initialized = false;
		},
		load:function( success , error ){

			this.list = [];
			this.slotMap = {};
			var _this = this;
			logToConsole(" formlist load実行 : ");
			
			var loadSuccess = function(res){
				 
				logToConsole(typeof(res) + "  読み込み成功 : " + res);
				if(res != null){
					_this.list = JSON.parse(res);
					_.each( _this.list , function(v) {
						_this.slotMap[v.slotId] = v;
					});
				}
				success();
			}
			
			var loadError = function(e){
				logToConsole("読み込み失敗 : " + e);
				error(e);
			}
			
			//まずはローカルから取得
			AppStorageManager.loadFormList(loadSuccess , loadError);
			
		},
		getList:function(){
			return $.extend(true, [], this.list );
		},
		add:function( form , success , error){
			var slotId = this.findBlankSlot();
			if(slotId <= 0){
				success(slotId);
			}
			
			var f = $.extend(true, {}, form );
			f.slotId = slotId;
			this.list.push( f );
			this.slotMap[slotId] = f;
			
			var InitFormData = $.extend(false , {} , FormData);
			InitFormData.formDetail = {input:{useImage:false,backgroundcolor:"fff"},finish:{useImage:false,backgroundcolor:"fff"}};
			InitFormData.formItemList = {input:[{localId:InitFormData.nextId() , FieldType:"label"  , Label:"登録お願いします" ,  HorizontalCenter:true , PosX:0 , PosY:20, Width:310 , Height:80 , TextColor:"000" , TextSize:2 },
			                                    {localId:InitFormData.nextId() , FieldType:"button" , Label:"送信" , HorizontalCenter:true , PosX:0 , PosY:200, Width:200 , Height:60 }
			                                    ],
			                             finish:[{localId:InitFormData.nextId() , FieldType:"label"  , Label:"登録ありがとうございます" ,  HorizontalCenter:true , PosX:0 , PosY:20, Width:310 , Height:80 , TextColor:"000" , TextSize:2 }
				                                 ]};
			
			var _this = this;
			var formdataSuccess = function(){
				_this.saveFormList( formlistSuccess , error);
			}
			
			var formlistSuccess = function(){
				success(slotId);
			}
			
			logToConsole("まずはデフォルトデータをスロットに保存 : " + slotId + " : " + InitFormData.toJsonString());
			AppStorageManager.saveFormData(InitFormData.toJsonString() , slotId , formdataSuccess , error );

		},
		findBlankSlot:function(){
			var res=-1;
			for(var i=0; i< AppStorageManager.FORM_SLOT_MAX ; i++){
				var tmp = this.slotMap[(i+1)];
				if(tmp == null){
					res = (i+1);
					break;
				}
			}
			return res;
		},
		
		saveFormList:function( success , error ){
			AppStorageManager.saveFormList(this.toJsonArrayString() , success , error );
		},
		
		updateFormTitle:function(slotId , name){
			var form = this.slotMap[slotId];
			if(form != null){
				form.name = name;
			}
		},
		
		deleteForm:function( slotId , success , error){
			var len = this.list.length - 1;
			for(var i = len; i >= 0; i--){
				if(this.list[i].slotId == slotId){
					this.list.splice(i,1);
				}
			}
			this.slotMap[slotId] = null;
			this.saveFormList( success , error );
		},
		
		toJsonArrayString:function(){
			var tmp = JSON.stringify( this.list );
			logToConsole("form list : " + tmp);
			return tmp;
		}
	};
	
	var SObjectDescribeManager = {
		initialized:false,
		// 1行のデータ例
		//{slotId:3 ,sObjectName:"Lead"}
		list:null,
		index:0,
		reset:function(){
			this.list = [];
			this.index = 0;
			for(var i=0;i<AppStorageManager.DESCRIBE_SLOT_MAX;i++){
				this.list.push({slotId:(i+1),sObjectName:""});
			}
			logToConsole("manager reset");
		},
		init:function(success , error){
			var _this = this;
			var loadSuccess = function(res){
				logToConsole("読み込み成功 : " + res);
				if(res != null){
					var tmpJson = JSON.parse(res);
					_this.list = tmpJson.list;
					_this.index = tmpJson.index;
				}else{
					_this.reset();
				}
				success();
			}
			
			var loadError = function(e){
				logToConsole("読み込み失敗 : " + e);
				_this.reset();
				error(e);
			}
			
			//ローカルから取得
			AppStorageManager.loadDescribeList(loadSuccess , loadError);
			
		},
		loadSObjectDescribe:function(objectname , success , error){
			var _this = this;
			var after = function(){
				var slotId = _this.findSlotId( objectname );
				if(slotId > 0){
					var loadAfter = function(res){
						logToConsole("ストレージからの読み込み完了 : ");
						if(res != null){
							res = JSON.parse(res);
						}
						success(res);
					}
					AppStorageManager.loadDescribeData(slotId , loadAfter , error);
				}else{
					success(null);
				}
			}
			
			if(this.list == null){
				this.init(after , after);
			}else{
				after();
			}
		},
		addSObjectDescribe:function(SObjectDescribe , success , error){
			logToConsole("describeデータの追加 : " + SObjectDescribe.name);
			var _this = this;
			var name = SObjectDescribe.name;
			var after = function(){
				var slotId = _this.findSlotId( name );
				if(slotId > 0){
					logToConsole("すでに登録済み : "+ slotId + " : " + name);
					success();
				}else{
					var slotId = (_this.index + 1);
					//indexを進めておく
					_this.list[_this.index].sObjectName = name;
					_this.index = (slotId % AppStorageManager.DESCRIBE_SLOT_MAX);
					logToConsole("保存： " + slotId + " : " + _this.index + " : " + SObjectDescribe.name);
					AppStorageManager.saveDescribeData( JSON.stringify( SObjectDescribe ), slotId , saveAfter , error);
				}
				
			}
			
			var saveAfter = function(){
				//list情報も記録する
				AppStorageManager.saveDescribeList( _this.toJsonString() , success , error);
			}
			
			if(this.list == null){
				this.init(after , after);
			}else{
				after();
			}
		},
		updateSObjectDescribe:function( SObjectDescribe , success , error ){
			logToConsole("describeデータの更新 : " + SObjectDescribe.name);
			var _this = this;
			var name = SObjectDescribe.name;
			var after = function(){
				var slotId = _this.findSlotId( name );
				if(slotId > 0){
					logToConsole("保存： " + slotId + " : " + _this.index + " : " + SObjectDescribe.name);
					AppStorageManager.saveDescribeData( JSON.stringify( SObjectDescribe ), slotId , success , error);
				}else{
					logToConsole("　未登録 : "+ slotId + " : " + name);
					error();
				}
			}
			
			if(this.list == null){
				this.init(after , after);
			}else{
				after();
			}
		},
		deleteSObjectDescribe:function( sobjectname , success , error  ){
			logToConsole("describeデータの削除 : " + sobjectname);
			var _this = this;
			var slotId = this.findSlotId( sobjectname );
			var after = function(){
				if(slotId > 0){
					for(var i=0;i<_this.list.length; i++){
						if(_this.list[i].slotId == slotId){
							_this.list[i].sObjectName = "";
						}
					}
					//まずはリストから更新
					AppStorageManager.saveDescribeList( _this.toJsonString() , saveAfter , error);
				}else{
					logToConsole("　未登録 : "+ slotId + " : " + sobjectname);
					success();
				}
			}
			
			var saveAfter = function(){
				//スロットの方も削除する
				AppStorageManager.removeDescribeData( success , error );
			}
			
			if(this.list == null){
				this.init(after , after);
			}else{
				after();
			}
		},
		findSlotId:function( sobjectname ){
			for(var i=0;i<this.list.length; i++){
				if(this.list[i].sObjectName == name){
					return  this.list[i].slotId;
				}
			}
			return -1;
		},
		toJsonString:function(){
			var tmpJson = {index:this.index , list:this.list};
			return JSON.stringify(tmpJson);
		}
		
	}
	
	//一つのフォームデータに関連する情報を集約させる
	var FormData = {
		idIndex:0,
		formSetting      : {} ,
		//{input:{useImage:true,backgroundcolor:"fff"},finish:{useImage:true,backgroundcolor:"fff"}}
		formDetail       : {} ,
		
		//{input:[...] , finish[...] }
		//{FieldType:"input" , FieldName:"LastName" , Label:"お名前" , Placeholder:"お名前を入力ください" , PosX:30 , PosY:40, Width:100 , Height:80 });
		//{FieldType:"input" , FieldName:"Email"    , Label:"メールアドレス" , Placeholder:"メールアドレスを入力ください" , PosX:30 , PosY:70, Width:120 , Height:80 });
		//{FieldType:"submit" , Label:"送信" ,  VerticalCenter:false , HorizontalCenter:true , PosX:40 , PosY:100, Width:70 , Height:40 });
		//{FieldType:"label" , Label:"テストっす" ,  PosX:60 , PosY:130, Width:70 , Height:40 });
		formItemList     : {} ,
		
		//画像情報一時保存用
		imageInfo : {} ,
		
		//{Name:"ActionDate__c" , Label:"活動日" , isUpdatable:true , Type:"Date" }
		//{Name:"PicklistRadioField__c" , Label:"Radioの項目" , isUpdatable:true , Type:"Picklist" , SelectValue:["AA","BB","CC"] }
		sObjectFields    : [],
		sObjectFieldMap  : {},
		isInitialized:false,
		
		reset:function(){
			this.idIndex = 0;
			this.formSetting = {};
			this.formDetail = {};
			this.formItemList = {};
			this.imageInfo = {};
			this.sObjectFields = [];
			this.sObjectFieldMap = {};
			this.isInitialized = false;
		},
		
		getSlotId:function(){
			return this.formSetting.slotId;
		},
		
		getFormTitle:function(){
			return this.formSetting.name;
		},
		setFormTitle:function(name){
			this.formSetting.name = name;
		},
		
		toJsonString:function(){
			var j = {};
			j.idindex = this.idIndex;
			j.detail = this.formDetail;
			j.itemlist = this.formItemList;
			return JSON.stringify( j );
		},
		nextId:function(){
			this.idIndex++;
			return this.idIndex;
		},
		init:function(form, success , error ){
			logToConsole("データ準備");
			if(this.isInitialized && form.slotId == this.formSetting.slotId){
				success();
				return;
			}
			
			var _this = this;
			var successFunc = function(){
				_this.isInitialized = true;
				success();
			}
			
			this.formSetting = form;
			this.load(successFunc , error);
			
		},
		
		load:function(success, error){
			
			//処理順
			//SObjectのDescribe情報取得(ストレージ or REST)
			//検索用Map生成
			//FormData読み込み
			
			this.formDetail      = {};
			this.formItemList    = {};
			this.imageInfo       = {input:{},finish:{}};
			this.sObjectFields   = [];
			this.sObjectFieldMap = {};
			
			var _this = this;
			
			var sobjectLoadSuccess = function(res){
				if(res == null){
					logToConsole("存在しないのでRestで取得");
					forcetkClient.describe(_this.formSetting.sobject , sobjectDownloadSuccess ,error);
				}else{
					logToConsole("ストレージから取得 : " + res.fields.length + " : " + res.name);
					_this.sObjectFields = res.fields;
					setupFields();
				}
			}
			
			var sobjectDownloadSuccess = function(result){
				
				logToConsole("SObject dl 成功 : " + result.name);
				var describe = convertSObjectDescribe(result);
				_this.sObjectFields = describe.fields;
				logToConsole("ストレージに記録します : " + describe.name);
				//ストレージにも保管しておく
				SObjectDescribeManager.addSObjectDescribe( describe , setupFields , error);
				
			}
			
			var setupFields = function(){
				
				//ラベル名でソート
				_this.sObjectFields = _.sortBy(_this.sObjectFields, function (f) { 
				    return f.Label; 
				});
				_this.sObjectFieldMap = {};
				for(var i=0; i<_this.sObjectFields.length;i++){
					_this.sObjectFieldMap[ _this.sObjectFields[i].Name ] = _this.sObjectFields[i];
				}
				
				_this.loadFormData(success , error);
				
			}
			
			//SObjectの情報から読み込んでいく
			SObjectDescribeManager.loadSObjectDescribe( this.formSetting.sobject , sobjectLoadSuccess , error);
			
		},
		
		loadFormData:function(success , error){
			
			this.formDetail      = {};
			this.formItemList    = {};
			this.imageInfo       = {input:{},finish:{}};
			
			var _this = this;
			var loadFormDataSuccess = function(res){
				
				logToConsole("FormData読み込み : " + res);
				var tmpRes = JSON.parse(res);
				
				_this.idIndex   = tmpRes.idindex;
				_this.formDetail = tmpRes.detail;
				_this.formItemList = tmpRes.itemlist;
				
				var inputBgLoadFunc = function( slotId ){
					var dfd = jQuery.Deferred();
					var s = function( data ){
						logToConsole("input image data : " + data.length);
						_this.imageInfo.input.data = data;
						dfd.resolve();
					}
					var e = function(){
						dfd.reject();
					}
					FileManager.loadInputBackgroundImage( slotId , s , e);
					return dfd.promise();
				}
				
				var finishBgLoadFunc = function( slotId ){
					var dfd = jQuery.Deferred();
					var s = function( data ){
						logToConsole("finish image data : " + data.length);
						_this.imageInfo.finish.data = data;
						dfd.resolve();
					}
					var e = function(){
						dfd.reject();
					}
					FileManager.loadFinishBackgroundImage( slotId ,  s , e);
					return dfd.promise();
				}
				
				var defaultDfdFunc = function(){
					var dfd = jQuery.Deferred();
					dfd.resolve();
					return dfd.promise();
				}
				
				var tmpInputBgFunc = defaultDfdFunc;
				var tmpFinishBgFunc = defaultDfdFunc;
				if(_this.formDetail.input.useImage){
					tmpInputBgFunc = inputBgLoadFunc;
				}
				if(_this.formDetail.finish.useImage){
					tmpFinishBgFunc = finishBgLoadFunc;
				}
				
				$.when(
					tmpInputBgFunc( _this.formSetting.slotId ) ,
					tmpFinishBgFunc( _this.formSetting.slotId )
				).done(function(){
					success();
				}).fail(function(){
					error();
				});
				
			}
			
			AppStorageManager.loadFormData( this.formSetting.slotId , loadFormDataSuccess , error);
			
		},
		
		saveFormData:function(success , error){
			
			var formSaveFunc = function( data , slotId ){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				AppStorageManager.saveFormData(  data , slotId , s , e);
				return dfd.promise();
			}
			
			var inputBgSaveFunc = function( slotId , imageData){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				FileManager.saveInputBackgroundImage( slotId , imageData , s , e);
				return dfd.promise();
			}
			
			var finishBgSaveFunc = function( slotId , imageData){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				FileManager.saveFinishBackgroundImage( slotId , imageData , s , e);
				return dfd.promise();
			}
			
			var defaultDfdFunc = function(){
				var dfd = jQuery.Deferred();
				dfd.resolve();
				return dfd.promise();
			}
			
			var tmpInputBgFunc = defaultDfdFunc;
			var tmpFinishBgFunc = defaultDfdFunc;
			if(this.getInputBgImageData() != null){
				tmpInputBgFunc = inputBgSaveFunc;
			}
			if(this.getFinishBgImageData() != null){
				tmpFinishBgFunc = finishBgSaveFunc;
			}
			
			var _this = this;
			formSaveFunc( this.toJsonString() , this.formSetting.slotId )
			.then(function(){
				return tmpInputBgFunc( _this.formSetting.slotId , _this.getInputBgImageData());
			}).then(function(){
				return tmpFinishBgFunc( _this.formSetting.slotId , _this.getFinishBgImageData());
			}).done(function(){
				success();
			}).fail(function(){
				error();
			});
		
		},
		
		deleteFormData:function( success , error ){
			AppDataDeleteManager.deleteFormData( this.getSlotId() , success , error );
		},
		
		getSObjectName:function(){
			return this.formSetting.sobject;
		},
		
		getFormDetail:function(){
			return this.formDetail;
		},
		
		getFormItemList:function(){
			return this.formItemList;
		},
		
		getSObjectFieldList:function(){
			//アプリで書き込んだりしないものはそのまま参照を渡す
			return this.sObjectFields;
		},
		
		findSObjectField:function(name){
			var s = this.sObjectFieldMap[name];
			if(s == null){
				return null;
			}
			return s;
		},
		updateFormItemToInput:function( item ){
			for(var i=0;i<this.formItemList.input.length; i++){
				if(this.formItemList.input[i].localId == item.localId){
					var f = $.extend(true, {}, item);
					this.formItemList.input[i] = f;
				}
			}
		},
		updateFormItemToFinish:function( item ){
			for(var i=0;i<this.formItemList.finish.length; i++){
				if(this.formItemList.finish[i].localId == item.localId){
					var f = $.extend(true, {}, item);
					this.formItemList.finish[i] = f;
				}
			}
		},
		addFormItemToInput:function( item ){
			var f = $.extend(true, {}, item);
			f.localId =  this.nextId();
			this.formItemList.input.push(f);
		},
		
		addFormItemToFinish:function( item ){
			var f = $.extend(true, {}, item);
			f.localId =  this.nextId();
			this.formItemList.finish.push(f);
		},
		
		deleteFormItemToInput:function( item ){
			var len = this.formItemList.input.length - 1;
			for(var i = len; i >= 0; i--){
				if(this.formItemList.input[i].localId == item.localId){
					this.formItemList.input.splice(i,1);
				}
			}
		},
		
		deleteFormItemToFinish:function( item ){
			var len = this.formItemList.finish.length - 1;
			for(var i = len; i >= 0; i--){
				if(this.formItemList.finish[i].localId == item.localId){
					this.formItemList.finish.splice(i,1);
				}
			}
		},
		
		setInputBgImageData:function( data ){
			this.imageInfo.input.data = data;
		},
		setFinishBgImageData:function( data ){
			this.imageInfo.finish.data = data;
		},
		getInputBgImageData:function(){
			return this.imageInfo.input.data;
		},
		getFinishBgImageData:function(){
			return this.imageInfo.finish.data;
		},
		
		getInputFormitemTemplate:function( field , values){
			
			////{FieldType:"input" , FieldName:"Email"    , Label:"メールアドレス" , Placeholder:"メールアドレスを入力ください" , PosX:30 , PosY:70, Width:120 , Height:80 });
			
			var resultTemp = {
					FieldType:"input", 
					FieldName:field.Name , 
					Label: values.Label , 
					Require: values.Require ,
					HorizontalCenter: values.HorizontalCenter ,
					PosX: values.PosX,
					PosY: values.PosY,
					Width: values.Width,
					Height: values.Height
			};
			var type = field.Type;
			if(type == SFFieldDefine.TYPE.STRING || type == SFFieldDefine.TYPE.EMAIL){
				resultTemp.Placeholder = values.Placeholder;
			}
			return resultTemp;
		},
		
		getLabelFormitemTemplate:function(values){
			var resultTemp = {
					FieldType:"label", 
					Label: values.Label , 
					HorizontalCenter: values.HorizontalCenter ,
					PosX: values.PosX,
					PosY: values.PosY,
					Width: values.Width,
					Height: values.Height,
					TextColor:values.TextColor,
					TextSize:values.TextSize
			};
			return resultTemp;
		}
		
	};

	var AppDataDeleteManager = {
		deleteAppConfig:function(success , error){
			logToConsole("delete app config");
			AppStorageManager.removeApplicationConfig(success , error );
		},
		deleteFormList:function(success , error){
			logToConsole("delete formlist");
			AppStorageManager.removeFormList(success , error );
		},
		deleteSObjectList:function(success , error){
			logToConsole("delete sobjectlist");
			AppStorageManager.removeSObjectList(success , error );
		},
		deleteSObjectDescribeAll:function(success , error){
			
			var listDeleteFunc = function(){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				AppStorageManager.removeDescribeList(s,e);
				return dfd.promise();
			}
			var dataDeleteFunc = function(){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				AppStorageManager.removeAllDescribeData(s,e);
				return dfd.promise();
			}
			
			logToConsole("delete describe all");
			listDeleteFunc().then(function(){
				return dataDeleteFunc();
			}).done(function(){
				success();
			}).fail(function(){
				error();
			});
			
		},
		deleteFormData:function( slotId , success , error){
			
			var formRemoveFunc = function( slotId ){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				logToConsole("delete from storage");
				AppStorageManager.removeFormData(slotId , s , e );
				return dfd.promise();
			}
			
			var inputBgRemoveFunc = function( slotId ){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				logToConsole("delete from file inputbg");
				FileManager.removeInputBackgroundImage( slotId  , s , e);
				return dfd.promise();
			}
			
			var finishBgRemoveFunc = function( slotId ){
				var dfd = jQuery.Deferred();
				var s = function(){
					dfd.resolve();
				}
				var e = function(){
					dfd.reject();
				}
				logToConsole("delete from file finishbg");
				FileManager.removeFinishBackgroundImage( slotId , s , e);
				return dfd.promise();
			}
			
			logToConsole("delete formdata");
			formRemoveFunc( slotId )
			.then(function(){
				return inputBgRemoveFunc( slotId );
			}).then(function(){
				return finishBgRemoveFunc( slotId );
			}).done(function(){
				success();
			}).fail(function(){
				error();
			});
			
		},
		deleteFormDataAll:function(success , error){
			var slotId = 1;
			var _this = this;
			logToConsole("delete formdata all");
			var successFunc = function(){
				logToConsole("削除 : " + slotId);
				slotId += 1;
				if( slotId > AppStorageManager.FORM_SLOT_MAX ){
					success();
					return;
				}
				_this.deleteFormData( slotId , successFunc , error);
			}
			logToConsole("delete formdata all");
			this.deleteFormData( slotId , successFunc , error);
		},
		
		deleteAll:function(success , error){

			var _this = this;
			var deleteAppConfigFunc = function(){
				var dfd = jQuery.Deferred();
				var s = function(){ dfd.resolve(); }
				var e = function(){ dfd.reject(); }
				_this.deleteAppConfig(s,e);
				return dfd.promise();
			}
			var deleteFormListFunc = function(){
				var dfd = jQuery.Deferred();
				var s = function(){ dfd.resolve(); }
				var e = function(){ dfd.reject(); }
				_this.deleteFormList(s,e);
				return dfd.promise();
			}
			var deleteSObjectListFunc = function(){
				var dfd = jQuery.Deferred();
				var s = function(){ dfd.resolve(); }
				var e = function(){ dfd.reject(); }
				_this.deleteSObjectList(s,e);
				return dfd.promise();
			}
			var deleteSObjectDescribeAllFunc = function(){
				var dfd = jQuery.Deferred();
				var s = function(){ dfd.resolve(); }
				var e = function(){ dfd.reject(); }
				_this.deleteSObjectDescribeAll(s,e);
				return dfd.promise();
			}
			var deleteFormDataAllFunc = function(){
				var dfd = jQuery.Deferred();
				var s = function(){ dfd.resolve(); }
				var e = function(){ dfd.reject(); }
				_this.deleteFormDataAll(s,e);
				return dfd.promise();
			}
			
			logToConsole("delete all");
			deleteFormListFunc().then(function(){
				return deleteSObjectDescribeAllFunc();
			}).then(function(){
				return deleteSObjectListFunc();
			}).then(function(){
				return deleteAppConfigFunc();
			}).then(function(){
				return deleteFormDataAllFunc();
			}).done(function(){
				success();
			}).fail(function(){
				error();
			});
			
		}
		
	};
	
	this.FormData = FormData;
	this.SObjectListData = SObjectListData;
	this.FormListData = FormListData;
	this.AppData = AppData;
	this.AppDataDeleteManager = AppDataDeleteManager;
	
	logToConsole("AppData:init完了");

}