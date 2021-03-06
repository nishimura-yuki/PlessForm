function initTopPage( modelDefine , datas , viewDefine) {

	logToConsole("TopPage:init開始");
	
	var AppDataDeleteManager = datas.AppDataDeleteManager;
	var AppData = datas.AppData;
	var FormListData = datas.FormListData;
	var FormData = datas.FormData;
	var FormSettingModel = modelDefine.FormSettingModel;
	var FormSettingCollection = modelDefine.FormSettingCollection;
	
	var SimplePopupView = viewDefine.SimplePopupView;

	//トップページ全体のView
    var TopPageView = Backbone.View.extend({
	    el:$("#top"),
		events:{
			"click #top_header_addform":"clickToAddFormPage" ,
			"click #top_header_setting":"showSettingPanel" ,
			"click #top_password_link":"clickPasswordLink" ,
			"click #top_logout_link":"clickLogoutLink" 
		},
		initialize:function () {
			logToConsole("top ページビュー初期化");
			
			_.bindAll(this);
			
			//子View
			this.formListView = new FormListView();
			
			//要素
			this.settingPanelEle = this.$el.find("#top_settings_panel");
			this.addFormBtnEle = this.$el.find("#top_header_addform");
			this.loginUserEle = this.$el.find("#top_loginuserid");
			
			//ポップアップ
			this.passwordPopup = new PassWordSettingPopupView();
			this.logoutPopup = new LogoutConfirmPopup();
			
		},
		render:function () {
		    return this;
		},
		init:function(){
			logToConsole("init");
			showLoading();
			var _this = this;
			var formListSuccess = function(){
				_this.formListView.refresh();
				_this.loginUserEle.text(AppData.getUserName());
				FormData.reset();
				if(FormListData.getList().length >= FormListData.MAX_DATA_NUM){
					_this.disableAddFormButton();
				}else{
					_this.enableAddFormButton();
				}
				hideLoading();
			}
			var formListError = function(){
				logToConsole("フォーム一覧読み込みエラー");
				hideLoading();
			}
			FormListData.init( formListSuccess , formListError);
			
		},
		clickToAddFormPage:function(){
			logToConsole("フォーム追加ページヘ");
			changePage({"toPage":"addForm"});
		},
		showSettingPanel:function(){
			logToConsole("アプリ設定画面を開く");
			this.settingPanelEle.panel("open");
		},
		clickPasswordLink:function(){
			logToConsole("パスワード設定 リンク");
			var _this = this;
			this.passwordPopup.open(
				{
					enable:AppData.isEnablePassword(),
					password:AppData.getAppPassword()
				},
				{
					save:function(value){
						_this.savePassword(value);
						_this.passwordPopup.close();
						_this.closePanel();
					},
					cancel:function(){
						_this.passwordPopup.close();
					}
				}
			);
		},
		
		clickLogoutLink:function(){
			logToConsole("ログアウト リンク");
			var _this = this;
			this.logoutPopup.open(
				{
					ok:function(){
						_this.logoutPopup.close();
						_this.logout();
					},
					cancel:function(){
						_this.logoutPopup.close();
					}
				}
			);
		},
		
		savePassword:function(value){
			logToConsole("パスワード保存");
			if(!value.enable){
				AppData.disablePassword();
			}else{
				AppData.setAppPassword( value.password );
			}
			AppData.saveConfig(
				function(){
					logToConsole("アプリ設定保存成功");
				} , 
				function(){
					logToConsole("アプリ設定保存に失敗");
				} 
			);
		},
		
		disableAddFormButton:function(){
			logToConsole("追加ボタン無効");
			this.addFormBtnEle.prop('disabled', true).addClass('ui-disabled');
		},
		enableAddFormButton:function(){
			logToConsole("追加ボタン有効");
			this.addFormBtnEle.prop('disabled', false).removeClass('ui-disabled');
		},
		
		closePanel:function(){
			this.settingPanelEle.panel("close");
		},
		
		logout:function(){
			//ログアウト処理
			//すべてのストレージ及びファイルデータを削除
			//ログアウト
			showLoading();
			AppDataDeleteManager.deleteAll(
				function(){
					cordova.require("salesforce/plugin/oauth").logout();
				},
				function(){
					logToConsole("完全削除処理でエラー発生");
					hideLoading();
				}
			);
			
		},
		
		dispose:function(){
			logToConsole("dispose");
			this.formListView.dispose();
		}
	});
	
	var FormListView = Backbone.View.extend({
		el:$("#top_formlist"),
		initialize:function () {
			this.collection = new FormSettingCollection();
			this.views =[];
		},
		render:function () {
			var _this = this;
			this.removeView();
			this.collection.each(function (item) {
				var tmpView = new FormItemView({model:item});
				_this.views.push(tmpView);
				tmpView.render();
				_this.$el.append(tmpView.$el);
			});
			this.$el.listview("refresh");
			return this;
		},
		refresh:function(){
			var _this = this;
			this.removeCollection();
			_.each( FormListData.getList() , function(f){
				var tmpModel = new FormSettingModel(f);
				tmpModel.innerData = f;
				_this.collection.add(tmpModel);
			});
			this.render();
		},
		removeCollection:function(){
			if(this.collection.length > 0){
            	var col = this.collection;
                _.each(this.collection.models , function(m) {
                	col.remove(m);
				});
			}
			this.collection = new FormSettingCollection();
		},
		removeView:function(){
            _(this.views).each(function(view) {
				view.remove();
			});
			this.views = [];
            this.$el.children().remove();
		},
		dispose:function(){
			this.removeCollection();
			this.removeView();
		}
	});
	
	var FormItemView = Backbone.View.extend({
		tagName:"li",
		tmpl:_.template($("#top_formlistitem").html()),
		events:{
			"click a":"clickForm"
		},
		initialize:function () {
		},
		render:function () {
			this.$el.html(this.tmpl(this.model.toJSON()));
			return this;
		},
		clickForm:function(){
			changePage({"toPage":"mainForm","form":this.model});
		}
	});

	var PassWordSettingPopupView = Backbone.View.extend({
		el:$("#top_password_popup"),
    	events:{
    		"click #top_password_save_btn":"clickSave",
    		"click #top_password_cancel_btn":"clickCancel",
    		"change #top_password_check":"changePassWordCheck"
    	},
    	initialize:function(){
    		this.checkEle = this.$el.find("#top_password_check");
    		this.inputEle = this.$el.find("#top_password_input");
    		this.inputErrorEle = this.$el.find("#top_password_inputerror");
    		this.callback = {};
    	},
    	clickSave:function(){
    		var tmpCheckVal = this.checkEle.prop("checked");
    		var tmpInputVal = this.inputEle.val();
    		logToConsole("check :" + tmpCheckVal + " :: input : " + tmpInputVal);
    		if(tmpCheckVal){
    			if(isEmpty(tmpInputVal)){
        			this.inputErrorEle.show();
        			return false;
        		}
    		}
    		this.callback.save({enable:tmpCheckVal , password:tmpInputVal});
    	},
    	clickCancel:function(){
    		this.callback.cancel();
    	},
    	changePassWordCheck:function(e){
    		var checked = $(e.target).prop("checked");
    		this.updateInput( checked );
    	},
    	
    	updateInput:function( checked ){
    		logToConsole("input 更新 : " + checked);
    		if(checked){
    			this.inputEle.prop("disabled" , false);
    		}else{
    			this.inputEle.prop("disabled" , true);
    		}
    	},
    	
    	open:function(value , callback){
    		logToConsole("パスワード設定開く");
    		this.inputErrorEle.hide();
    		this.checkEle.prop( "checked" , value.enable ).checkboxradio("refresh" , true);
    		this.inputEle.val( value.password );
    		this.updateInput( value.enable );
    		this.callback = callback;
    		this.$el.popup("open");
    	},
    	close:function(){
    		try{
    			this.$el.popup("close");
    		}catch( e ){
    		}
    	}
	});
	
	var LogoutConfirmPopup = SimplePopupView.extend({
		el:$("#top_logout_popup"),
    	events:{
    		"click #top_logout_ok_btn":"clickOk",
    		"click #top_logout_cancel_btn":"clickOk"
    	}
	});
	
	this.TopPageView = TopPageView;
	
	logToConsole("TopPage:init完了");
	
}
