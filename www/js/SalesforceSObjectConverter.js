function initSFSObjectConverter(){
	
	//SFから取得したSObjectデータをアプリ用の軽量なものに変換する
	//アプリで使用しないオブジェクトや項目はここで除外しておく
	
	//アプリで使用可能な標準オブジェクト
	var INCLUDE_STANDARDSOBJECT_NAMES = {
		Account:true,
		Lead:true,
		Contact:true,
		Campaign:true,
		Opportunity:true
	};
	
	//アプリで使用可能な項目のデータ型
	var INCLUDE_DATATYPE_LIST = [
	                             SFFieldDefine.TYPE.STRING,
	                             SFFieldDefine.TYPE.EMAIL//,
	                             //SFFieldDefine.TYPE.TEXTAREA,
	                             //SFFieldDefine.TYPE.PICKLIST,
	                             //SFFieldDefine.TYPE.MULTIPICKLIST,
	                             //SFFieldDefine.TYPE.INT,
	                             //SFFieldDefine.TYPE.DOUBLE,
	                             //SFFieldDefine.TYPE.DATE,
	                             //SFFieldDefine.TYPE.DATETIME,
	                             //SFFieldDefine.TYPE.URL,
	                             //SFFieldDefine.TYPE.CURRENCY,
	                             //SFFieldDefine.TYPE.PHONE,
	                             //SFFieldDefine.TYPE.BOOLEAN
	                             ];

	//アプリで利用しない標準オブジェクトの項目名
	var EXCLUDE_FIELD_NAMES = {
			Jigsaw:true
	};
	
	var INCLUDE_DATATYPE_NAMES = {};
	_.each( INCLUDE_DATATYPE_LIST , function( t ){
		INCLUDE_DATATYPE_NAMES[t] = true;
	});

	this.convertSObjectList = function(result){
		
		var objects = result.sobjects;
		var resultList = [];
		_.each(objects , function(v) {
			if(v.createable && v.updateable && !v.customSetting){
				if(v.custom || INCLUDE_STANDARDSOBJECT_NAMES[v.name] ){
					var tmp = {};
					tmp.Name = v.name;
					tmp.Label = v.label;
					resultList.push(tmp);
				}
			}
		});
		return resultList;
	}
	
	this.convertSObjectDescribe = function(result){
		
		var fields = result.fields;
		var resultJson = {};
		resultJson.name = result.name;
		resultJson.fields = [];
		_.each( fields , function(f){
			if(f.updateable && f.createable && !f.autoNumber &&
				INCLUDE_DATATYPE_NAMES[f.type] && 
				(f.custome || !EXCLUDE_FIELD_NAMES[f.name])
			){
				//console.log("-- " + f.name);
				var tmpJson = {};
				tmpJson.Name = f.name;
				tmpJson.Label = f.label;
				tmpJson.Type = f.type;
				tmpJson.Nillable = f.nillable;
				tmpJson.Length = f.length;
				if(f.type == SFFieldDefine.TYPE.PICKLIST ||
					f.type == SFFieldDefine.TYPE.MULTIPICKLIST){
					tmpJson.SelectValue = [];
					_.each( f.picklistValues , function(v){
						tmpJson.SelectValue.push(v.value);
					});
				}
				resultJson.fields.push(tmpJson);
			}
		});
		
		return resultJson;
	}
}