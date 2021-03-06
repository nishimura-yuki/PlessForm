function initAddFormPage( modelDefine , datas) {

	logToConsole("AddPage:init開始");
	
	var SObjectListData = datas.SObjectListData;
	var FormListData = datas.FormListData;
	var AppData = datas.AppData;
	var FormData = datas.FormData;
	
	//フォーム追加ページ全体のView
    var AddFormPageView = Backbone.View.extend({
	    el:$("#addForm"),
		events:{
			"click #addform_return_btn":"moveToTopPage",
			"click #addform_refresh_btn":"refreshSObjectList"
		},
		initialize:function () {
			_.bindAll(this);
			logToConsole("addform ページビュー初期化");
			this.sObjectList = new SObjectListView();
			this.popupView = new FormSettingPopupView();
			this.listenTo(this.sObjectList , "select" , this.eventSelectSObject);
		},
		render:function () {
		    return this;
		},
		eventSelectSObject:function(){
			this.popupView.model = arguments[0];
			this.popupView.render();
			this.popupView.show();
		},
		moveToTopPage:function(){
			logToConsole("トップページヘ");
			changePage({"toPage":"top"});
		},
		refreshSObjectList:function(){
			logToConsole("リスト更新");
			showLoading();
			var _this = this;
			var removeSuccess = function(){
				SObjectListData.load(loadSuccess , loadError);
			};
			var removeError = function(){
				logToConsole("error!!!");
				hideLoading();
			};
			
			var loadSuccess = function(){
				_this.sObjectList.refresh();
				logToConsole("更新成功!");
				hideLoading();
			};
			var loadError = function(){
				logToConsole("error!!!");
				hideLoading();
			};
			SObjectListData.remove(removeSuccess , removeError);
			
		},
		init:function(){
			logToConsole("フォーム追加ページ初期化");
			showLoading();
			var _this = this;
			var success = function(){
				logToConsole("データ読み込み完了");
				_this.sObjectList.refresh();
				FormData.reset();
				hideLoading();
			};
			var error = function(){
				hideLoading();
				logToConsole("error!!!");
			};
			SObjectListData.init(success , error);
		},
		dispose:function(){
			this.sObjectList.dispose();
			this.popupView.dispose();
		}
	});
	
	var SObjectListView = Backbone.View.extend({
		el:$("#addform_sobjectlist"),
		initialize:function () {
			_.bindAll(this);
			this.collection = new SObjectCollection();
			this.views =[];
		},
		render:function () {
			var _this = this;
			this.removeView();
			this.collection.each(function (item) {
				var tmpView = new SObjectView({model:item});
				_this.views.push(tmpView);
				tmpView.render();
				_this.$el.append(tmpView.$el);
			});
			this.$el.listview("refresh");
			return this;
		},
		refresh:function(){
			this.removeCollection();
			var _this = this;
			var SObjectList = SObjectListData.getList();
			_.each( SObjectList , function(v){
			    logToConsole(v.Name + " :: " + v.Label);
				var tmpModel = new SObjectModel({"Name":v.Name , "Label":v.Label});
				_this.collection.add(tmpModel );
				_this.listenTo(tmpModel , "select" , _this.eventSelectSObject);
				
			});
			this.render();
		},
		eventSelectSObject:function(){
			this.trigger("select" , arguments[0]);
		},
		removeCollection:function(){
			logToConsole("removeCollection : " + this.collection.length);
			if(this.collection.length > 0){
            	var col = this.collection;
                _.each(this.collection.models , function(m) {
                	col.remove(m);
				});
			}
			this.collection = new SObjectCollection();
		},
		removeView:function(){
            _.each(this.views , function(v) {
				v.remove();
			});
			this.views = [];
            this.$el.children().remove();
		},
		dispose:function(){
			this.removeCollection();
			this.removeView();
		}
	});
	
	var SObjectView = Backbone.View.extend({
		tagName:"li",
		tmpl:_.template($("#addform_sobjectitem").html()),
		events:{
			"click a":"relPopup"
		},
		initialize:function () {
		},
		render:function () {
			this.$el.html(this.tmpl(this.model.toJSON()));
			this.$el.attr("data-icon" , "false");
			return this;
		},
		relPopup:function(){
			logToConsole(this.model.get("Name") + " : " + this.model.get("Label"));
			this.model.trigger("select" , this.model);
		}
	});
	
	var FormSettingPopupView = Backbone.View.extend({
		el:$("#addform_formsetting"),
		events:{
			"click #addform_save_btn":"saveForm",
			"click #addform_cancel_btn":"saveCancel"
		},
		initialize:function () {
			this.objectLabel = this.$el.find("#addform_selectedsobject_label");
			this.objectName = this.$el.find("#addform_selectedsobject_name");
			this.inputName  = this.$el.find("#addform_formname_input");
			this.inputError = this.$el.find("#addform_formname_inputerror");
		},
		render:function () {
			this.objectLabel.text(this.model.get("Label"));
			this.objectName.text(this.model.get("Name"));
			this.inputError.hide();
			return this;
		},
		saveForm:function(){
			
			var inputName = this.inputName.val();
			if(isEmpty(inputName)){
				this.inputError.show();
				return;
			}
			
			logToConsole(this.model.get("Name") + " : " + this.model.get("Label") + " : " + inputName);
			showLoading();
			
			var _this = this;
			var saveSuccess = function(slotId){
				logToConsole("ID : " + slotId +"のスロットに記録");
				_this.close();
				changePage({"toPage":"top"});
				//トップページに遷移するのでローディングは解除しない
			}
			var saveError = function(e){
				logToConsole("フォーム追加時にエラー");
				hideLoading();
			}
			
			FormListData.add({name:inputName ,sobject:this.model.get("Name") } , saveSuccess , saveError );
			
		},
		saveCancel:function(){
			this.close();
		},
		close:function(){
			try{
				this.$el.popup("close");
			}catch(e){
			}
		},
		show:function(){
			this.inputName.val("");
			this.$el.popup("open");
		},
		dispose:function(){
			if(this.model != null){
				this.model =null;
			}
		}
	});
	
	var SObjectModel = modelDefine.SObjectModel;
	var SObjectCollection = modelDefine.SObjectCollection;
	
	this.AddFormPageView = AddFormPageView;
	
	logToConsole("AddPage:init完了");
	
}
