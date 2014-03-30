function initModel(){

	logToConsole("Model:init開始");

	var FormSettingModel = this.FormSettingModel = Backbone.Model.extend({
		name:"",
		sobject:"",
		innerData:{}
	});
	
	this.FormSettingCollection = Backbone.Collection.extend({
		model: FormSettingModel
	});
	
	var SObjectModel = this.SObjectModel = Backbone.Model.extend({
		Name:"",
		Label:""
	});
	this.SObjectCollection = Backbone.Collection.extend({
		model: SObjectModel
	});

	var InputFormItemModel = this.InputFormItemModel = Backbone.Model.extend({
		inputsetting:{},
		fieldinfo:{}
	});
	this.InputFormItemCollection = Backbone.Collection.extend({
		model : InputFormItemModel
	});
	
	var ButtonFormItemModel = this.ButtonFormItemModel = Backbone.Model.extend({
		buttonsetting:{}
	});
	this.ButtonFormItemCollection = Backbone.Collection.extend({
		model : ButtonFormItemModel
	});
	
	var LabelFormItemModel = this.LabelFormItemModel = Backbone.Model.extend({
		labelsetting:{}
	});
	this.LabelFormItemCollection = Backbone.Collection.extend({
		model : LabelFormItemModel
	});
	
	var CreateSObjectModel = this.CreateSObjectModel = Backbone.Model.extend({
		sobjectType: "",
		fieldlist: [],
		toJsonFromValues:function(){
			var j = {};
			var _this = this;
			_.each( this.fieldlist , function( f ){
				var tmp = _this.get( f );
				if( tmp != null ){
					j[ f ] = tmp;
				}
			});
			logToConsole(JSON.stringify(j));
			return j;
		}
	});

	logToConsole("Model:init完了");

}
