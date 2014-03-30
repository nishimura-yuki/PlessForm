function initInputSettingPage( modelDefine , datas , viewDefine) {

	logToConsole("InputSettingPage:init開始");

	var FormData = datas.FormData;
	var FormListData = datas.FormListData;
	var AppData = datas.AppData;
	
	var LocalFormData = {};
	var FormDetail = {};
	var FormItemList = [];
	
	//View定義情報設定
	var BaseInputContentView = viewDefine.BaseInputContentView;
	var BaseTextLabelFormItemView = viewDefine.TextLabelFormItemView;
	var BaseSubmitButtonFormItemView = viewDefine.SubmitButtonFormItemView;
	var BaseInputFormItemView = viewDefine.BaseInputFormItemView;
	var BaseMailAddressInputFormItemView = viewDefine.MailAddressInputFormItemView;
	var BaseStringInputFormItemView = viewDefine.StringInputFormItemView;
	var SimplePopupView = viewDefine.SimplePopupView;
	
	//Model定義情報設定
	var InputFormItemModel = modelDefine.InputFormItemModel;
	var ButtonFormItemModel = modelDefine.ButtonFormItemModel;
	var LabelFormItemModel = modelDefine.LabelFormItemModel;	
	var InputFormItemCollection = modelDefine.InputFormItemCollection;
	var LabelFormItemCollection = modelDefine.LabelFormItemCollection;
	var ButtonFormItemCollection = modelDefine.ButtonFormItemCollection;
	
	//入力画面設定全体のView
    var InputSettingPageView = Backbone.View.extend({
    	el:$("#inputsetting"),
		events:{
			"click #inputsetting_header_backbtn":"clickReturn",
			"click #inputsetting_header_savebtn":"clickSave",
			"click .footer_navi":"clickEditMode" ,
		},
		
		initialize:function(){
			
			logToConsole("inputsetting ページビュー初期化");
			
			_.bindAll(this);
			
			this.returnWindow = "";
			
			//子View
			this.contentView = new ContentView();
			this.itemsettingPopup = new ItemSettingPopup();
			this.savePopup   = new SaveConfirmPopupView();
			this.returnPopup = new ReturnConfirmPopupView();
			
			//画面サイズを指定（余白をクリア 無理矢理）
			this.contentEle = this.$el.find("#inputsetting_content");
			this.contentEle.css("width"  , getWindowWidth() + "px");
			this.contentEle.css("height" , getWindowHeight() + "px");
			this.contentEle.css("padding"  , "0px");
			this.contentEle.css("margin" , "0px");
			
			//モードごとの編集ビュー
			this.editPositionView   = new EditPositionView();
			this.editSettingView    = new EditSettingView();
			this.editAdditemView    = new EditAdditemView();
			this.editBackgroundView = new EditBackgroundView();

			//項目設定のポップアップ表示のイベント
			this.listenTo(this.editSettingView    , "itemsettingpopup" , this.eventItemsettingPopup);
			this.listenTo(this.editAdditemView    , "itemsettingpopup" , this.eventItemsettingPopup);
			
			//項目追加のイベント
			this.listenTo(this.editAdditemView    , "addinputitem" , this.eventAddInputFormItem);
			this.listenTo(this.editAdditemView    , "addlabelitem" , this.eventAddLabelFormItem);
			
			//項目削除のイベント
			this.listenTo(this.editSettingView    , "deleteinputitem" , this.eventDeleteInputFormItem);
			this.listenTo(this.editSettingView    , "deletelabelitem" , this.eventDeleteLabelFormItem);
			
			//項目編集のイベント
			this.listenTo(this.editSettingView    , "updateinputitem" , this.eventUpdateInputFormItem);
			this.listenTo(this.editSettingView    , "updatelabelitem" , this.eventUpdateLabelFormItem);
			this.listenTo(this.editSettingView    , "updatebuttonitem" , this.eventUpdateButtonFormItem);
			
			//画像選択時のイベント
			//this.listenTo(this.editBackgroundView , "selectBgImage" , this.eventSelectBgImage);
			this.editBackgroundView.backgroundEle = this.contentView.$el;
			
			//画像有効無効変更時のイベント
			this.listenTo(this.editBackgroundView , "ChangeImageActive" , this.eventChangeImageActive);
			
			//背景色更新時のイベント
			this.listenTo(this.editBackgroundView , "ChangeBgColor" , this.eventChangeBgColor);
			
			//フッター部分
			this.footer = this.$el.find("#inputsetting_footer");
			this.footerNavi = this.$el.find("#inputsetting_footer_navi");
			this.currentEditView = null;
			this.currentEditId   = "";
			
		},

		init:function(args){
			
			FormDetail = {};
			FormItemList = [];
			
			this.returnWindow = args.returnWindow;
			
			var _this = this;
			var initFunc = function(){
				_this.setFormData();
				_this.refreshFormContent();
				_this.currentEditView = null;
				_this.changeEditMode("inputsetting_footer_navi_position");
			}
			
			if(args.form != null){
				
				var _this = this;
				var success = function(){
					logToConsole("FormData init 完了");
					initFunc();
					hideLoading();
				}
				var error = function(){
					logToConsole("フォームデータ初期化エラー");
					hideLoading();
				}
				
				//マスクをかける
				showLoading();
				FormData.init( args.form.innerData , success , error );
			}else{
				initFunc();
			}
		},
		setFormData:function(){
			LocalFormData = $.extend(true, {}, FormData);
			FormDetail = LocalFormData.getFormDetail().input;
			FormItemList = LocalFormData.getFormItemList().input;
			
			this.contentView.formdata = LocalFormData;
			this.contentView.detail   = FormDetail;
		},
		
		refreshWindow:function(){
			this.refreshFormContent();
			this.refreshEditFooter();
		},
		
		refreshFormContent:function(){
			
			logToConsole("画面再更新");
			this.contentView.reset();
			
			var _this = this;
			logToConsole( "::" + FormItemList.length );
			_.each( FormItemList , function(f){
				var tmpModel = null;
				if(f.FieldType == "label"){
					tmpModel = new LabelFormItemModel({ labelsetting:f });
					_this.contentView.addLabelModel( tmpModel );
				}else if(f.FieldType == "button"){
					tmpModel = new ButtonFormItemModel({ buttonsetting:f });
					_this.contentView.button = tmpModel;
				}else{
					var fieldInfo = LocalFormData.findSObjectField(f.FieldName);
					if(fieldInfo == null){
						logToConsole("項目情報の不整合が発生している : " + f.FieldName);
						return;
					}
					
					tmpModel = new InputFormItemModel({
						inputsetting:f,
						fieldinfo:fieldInfo
					});
					_this.contentView.addInputModel( tmpModel );
					
				}
				_this.listenTo(tmpModel , "touch" , _this.eventTouchFormitem);
			});
			
			this.contentView.render();
		
		},
		refreshEditFooter:function(){
			if(this.currentEditView == null){
				return;
			}
			this.currentEditView = null;
			this.changeEditMode( this.currentEditId );
		},
		changeEditMode:function( targetId ){
			
			logToConsole("changeMode : " + targetId);
			
			var nextView = null;
			var refreshFunc = null;
			if( targetId == "inputsetting_footer_navi_position"){
				nextView = this.editPositionView;
				refreshFunc = this.contentView.refreshPositionMode;
			}else if( targetId == "inputsetting_footer_navi_setting"){
				nextView = this.editSettingView;
				refreshFunc = this.contentView.refreshSettingMode;
			}else if( targetId == "inputsetting_footer_navi_additem"){
				nextView = this.editAdditemView;
				refreshFunc = this.contentView.refreshAdditemMode;
			}else if( targetId == "inputsetting_footer_navi_background"){
				nextView = this.editBackgroundView;
				refreshFunc = this.contentView.refreshBackgroundMode;
			}
			
			//現在と同じ場合は何もしない
			if(this.currentEditView == nextView){
				logToConsole("同じビューなので特に更新しない");
				return ;
			}
			this.currentEditId = targetId;
			
			this.footerNavi.find(".footer_navi").removeClass("ui-btn-active");
			this.editPositionView.reset();
			this.editSettingView.reset();
			this.editAdditemView.reset();
			this.editBackgroundView.reset();
			
			//画面全体も編集モードに併せて更新
			refreshFunc();
			//編集Viewを初期化
			this.footerNavi.find("#" + targetId).addClass("ui-btn-active");
			nextView.init();
			this.currentEditView = nextView;
			
			logToConsole("changeMode end");
			
		},
				
		clickEditMode:function( e ){
			this.changeEditMode( $(e.target).closest(".footer_navi").attr("id") );
		},
		
		clickReturn:function(){
			logToConsole("click return");
			if(FormData.toJsonString() != LocalFormData.toJsonString() ||
				FormData.getInputBgImageData() != LocalFormData.getInputBgImageData()){
				
				var _this = this;
				
				var returnFunc = function(){
					logToConsole("戻る");
					_this.returnPopup.close();
					_this.returnMainFormPage();
				}
				var cancelFunc = function(){
					_this.returnPopup.close();
				}
				var saveFunc = function(){
					var success = function(){
						logToConsole("保存は成功 : " + _this);
						hideLoading();
						returnFunc();
					}
					var error = function(){
						logToConsole("FormData保存処理に失敗");
						hideLoading();
					}
					
					showLoading();
					_this.saveFormData( success , error);
				}
				this.returnPopup.open( {ok:returnFunc , cancel:cancelFunc , other:saveFunc} );
			}else{
				this.returnMainFormPage();
			}
		},
		clickSave:function(){
			logToConsole("click save");
			var _this = this;
			var saveFunc = function(){
				var success = function(){
					logToConsole("FormData保存処理 成功！");
					hideLoading();
					_this.refreshWindow();
					_this.savePopup.close();
				}
				var error = function(){
					logToConsole("FormData保存処理に失敗");
					hideLoading();
				}
				showLoading();
				_this.saveFormData( success , error);
			}
			
			var cancelFunc = function(){
				_this.savePopup.close();
			}
			
			this.savePopup.open( {ok:saveFunc , cancel:cancelFunc} );
		},

		saveFormData:function( success , error ){
			
			var _this = this;
			
			var saveSuccess = function(){
				logToConsole("保存成功！！");
				FormData.loadFormData(loadSuccess , error);
			}
			var loadSuccess = function(){
				logToConsole("再読み込み完了！！");
				_this.setFormData();
				success();
			}
			
			//編集によっては画像利用と内部の画像データの設定状態に矛盾が生じる可能性があるため
			//ここでデータを調整しておく
			if( FormDetail.useImage ){
				if( LocalFormData.getInputBgImageData() == null){
					FormDetail.useImage = false;
				}
			}else{
				if( LocalFormData.getInputBgImageData() != null){
					LocalFormData.setInputBgImageData(null);
				}
			}
			
			//完了画面の画像まで再保存するのは無駄なので
			//nullをセットしておく
			LocalFormData.setFinishBgImageData(null);
			
			LocalFormData.saveFormData( saveSuccess , error);
			
		},
		
		returnMainFormPage:function(){
			logToConsole("return main");
			changePage({"toPage":"mainForm","formtype":this.returnWindow});
		},

		eventItemsettingPopup:function(callback , param){
			logToConsole("popup event");
			this.itemsettingPopup.show( callback , param );
		},
		
		eventTouchFormitem:function(){
			this.currentEditView.touchItemView(arguments[0]);
		},
		
		eventAddInputFormItem:function(field , values){
			values.HorizontalCenter = true;
			values.PosX   = 0;
			values.PosY   = (getWindowHeight() / 2 - 40);
			values.Width  = (getWindowWidth() / 2);
			values.Height = 80;
			LocalFormData.addFormItemToInput( LocalFormData.getInputFormitemTemplate(field , values) );
			this.refreshWindow();
		},
		eventAddLabelFormItem:function(values){
			values.HorizontalCenter = true;
			values.PosX   = 0;
			values.PosY   = (getWindowHeight() / 2 - 40);
			values.Width  = (getWindowWidth() / 2);
			values.Height = 80;
			LocalFormData.addFormItemToInput( LocalFormData.getLabelFormitemTemplate(values) );
			this.refreshWindow();
		},
		
		eventUpdateInputFormItem:function(item , values){
			logToConsole("input項目更新");
			for( k in values){
				logToConsole("key : " + k + " : v = " + values[k]);
				if(item[k] != null){
					item[k] = values[k];
				}
			}
			LocalFormData.updateFormItemToInput( item );
			this.refreshWindow();
		},
		eventUpdateLabelFormItem:function(item , values){
			logToConsole("label項目更新");
			for( k in values){
				logToConsole("key : " + k + " : v = " + values[k]);
				if(item[k] != null){
					item[k] = values[k];
				}
			}
			LocalFormData.updateFormItemToInput( item );
			this.refreshWindow();
		},
		eventUpdateButtonFormItem:function(item , values){
			logToConsole("button項目更新");

			this.refreshWindow();
		},
		eventDeleteInputFormItem:function(item){
			logToConsole("input項目削除");
			LocalFormData.deleteFormItemToInput( item );
			this.refreshWindow();
		},
		eventDeleteLabelFormItem:function(item){
			logToConsole("label項目削除");
			LocalFormData.deleteFormItemToInput( item );
			this.refreshWindow();
		},
		
		eventChangeImageActive:function( ){
			this.contentView.renderBackgroundImage();
		},
		
		eventChangeBgColor:function( color ){
			logToConsole("ff : " + color);
			FormDetail.backgroundcolor = color;
			this.contentView.renderBackgroundColor();
		},
		
		dispose:function(){
			this.contentView.dispose();
			
			this.editPositionView.dispose();
			this.editSettingView.dispose();
			this.editAdditemView.dispose();
			this.editBackgroundView.dispose();
			
			LocalFormData = {};
			FormDetail = {};
			FormItemList = [];
			
		}
    });

	var ContentView = BaseInputContentView.extend({
		el:$("#inputsetting_content_inner"),
		events:{
		},
		initialize:function () {
			BaseInputContentView.prototype.initialize.call(this);
			_.bindAll(this);
			this.$el.css("width"  , getWindowWidth() + "px");
			this.$el.css("height" , getWindowHeight() + "px");
		},

		renderFormItem:function(){
			
			logToConsole("setting input renderitem");
			
			BaseInputContentView.prototype.renderFormItem.call(this);
			logToConsole("setting input renderitem end??");
			
			this.buttonView.disableClick();
			
			logToConsole("setting input renderitem end");
		
		},
		
		resetEditRender:function(){
			logToConsole("編集用の描画をリセット");
			_(this.inputViews).each(function(view) {
				view.resetRenderOption();
			});
			_(this.labelViews).each(function(view) {
				view.resetRenderOption();
			});
			this.buttonView.resetRenderOption();
		},
		
		refreshPositionMode:function(){
			logToConsole("配置設定用に更新");
			this.resetEditRender();
			_(this.inputViews).each(function(view) {
				view.renderPosition();
			});
			_(this.labelViews).each(function(view) {
				view.renderPosition();
			});
			this.buttonView.renderPosition();
		},
		refreshSettingMode:function(){
			logToConsole("項目設定用に更新");
			this.resetEditRender();
			_(this.inputViews).each(function(view) {
				view.renderSetting();
			});
			_(this.labelViews).each(function(view) {
				view.renderSetting();
			});
			this.buttonView.renderSetting();
		},
		refreshAdditemMode:function(){
			logToConsole("項目追加用に更新");
			this.resetEditRender();
		},
		refreshBackgroundMode:function(){
			logToConsole("背景設定用に更新");
			this.resetEditRender();
		},
		
		createInputFormItemView:function( m ){
			logToConsole("createInputFormItemView ");
			var field   = m.get("fieldinfo");
			var setting = m.get("inputsetting");
			var type = field.Type;
			logToConsole("type :" + type);
			if(type == SFFieldDefine.TYPE.STRING){
				return new StringInputFormItemView();
			}else if(type == SFFieldDefine.TYPE.EMAIL){
				return new MailAddressInputFormItemView();
			}
			return null;
		},
		createTextLabelFormItemView:function(){
			return new TextLabelFormItemView();
		},
		createSubmitButtonFormItemView:function(){
			return new SubmitButtonFormItemView();
		}
		
	});
    

	var SaveConfirmPopupView = SimplePopupView.extend({
		el:$("#inputsetting_saveconfirm_popup"),
		events:{
    		"click #inputsetting_saveconfirm_save":"clickOk",
    		"click #inputsetting_saveconfirm_cancel":"clickCancel"
    	}
	});
	
	var ReturnConfirmPopupView = SimplePopupView.extend({
		el:$("#inputsetting_returnconfirm_popup"),
		events:{
    		"click #inputsetting_returnconfirm_return":"clickOk",
    		"click #inputsetting_returnconfirm_cancel":"clickCancel",
    		"click #inputsetting_returnconfirm_save":"clickOther"
    	}
	});
	
    var ItemDeleteConfirmPopupView =  SimplePopupView.extend({
    	el:$("#inputsetting_itemdeleteconfirm_popup"),
    	events:{
    		"click #inputsetting_itemdeleteconfirm_delete":"clickOk",
    		"click #inputsetting_itemdeleteconfirm_cancel":"clickCancel"
    	}
    });
    
    
    var EditPositionView = Backbone.View.extend({
    	el:$("#inputsetting_footer_position"),
    	events:{
    		"click #inputsetting_formitem_pos_btn":"clickPositionUpdate",
    		"change #inputsetting_footer_position_center_check":"changeCenterCheck"
    	},
    	initialize:function(){
    		
    		//配置設定関連
			this.selectedItemView = null;
			this.xposEle   = this.$el.find("#inputsetting_formitem_xpos");
			this.yposEle   = this.$el.find("#inputsetting_formitem_ypos");
			this.widthEle  = this.$el.find("#inputsetting_formitem_width");
			this.heightEle = this.$el.find("#inputsetting_formitem_height");
			this.centerEle = this.$el.find("#inputsetting_footer_position_center_check");
			
    	},
    	init:function(){
    		this.$el.show();
    	},
    	reset:function(){
			this.selectedItemView = null;
			this.xposEle.val("0");
    		this.yposEle.val("0");
    		this.widthEle.val("0");
    		this.heightEle.val("0");
    		
    		this.$el.hide();
    	},
    	updatePositionEle:function(){
    		if(this.selectedItemView != null){
	    		this.xposEle.val( this.selectedItemView.formitem.PosX );
	    		this.yposEle.val( this.selectedItemView.formitem.PosY );
	    		this.widthEle.val( this.selectedItemView.formitem.Width );
	    		this.heightEle.val( this.selectedItemView.formitem.Height );
    		}
    	},
    	touchItemView:function(itemView){
    		this.selectedItemView = itemView;
    		this.updatePositionEle();
    		if(this.selectedItemView.formitem.HorizontalCenter){
    			this.centerEle.prop("checked" , true); 
    			this.xposEle.prop("disabled" , true);
    		}else{
    			this.centerEle.prop("checked" , false); 
    			this.xposEle.prop("disabled" , false);
    		}
    		this.centerEle.checkboxradio("refresh" , true);
    	},
    	clickPositionUpdate:function(){
    		if(this.selectedItemView == null){
    			return false;
    		}
    		
    		var xpos   = this.xposEle.val();
    		var ypos   = this.yposEle.val();
    		var width  = this.widthEle.val();
    		var height = this.heightEle.val();
    		
			if(xpos == null || !isNumber(xpos) ||
				ypos == null || !isNumber(ypos) ||
				width == null || !isNumber(width) ||
				height == null || !isNumber(height) 
			){
				return false;
			}
			
			this.selectedItemView.updatePosition({
				X: Number(xpos) ,
				Y: Number(ypos) ,
				Width: Number(width) ,
				Height: Number(height) 
			});
			
    	},
    	changeCenterCheck:function( e ){
    		var checked = $(e.target).prop("checked");
    		logToConsole("チェックが更新された : " + checked);
    		if(this.selectedItemView != null){
    			this.xposEle.prop("disabled" , checked);
    			this.selectedItemView.formitem.HorizontalCenter = checked;
    			if(checked){
    				//位置を更新する
    				this.selectedItemView.setPosition();
    				this.updatePositionEle();
    			}
    		}
    	},
		dispose:function(){
			//特にやることない
		}
    });

    var EditSettingView = Backbone.View.extend({
    	el:$("#inputsetting_footer_setting"),
    	initialize:function(){
    		
    		_.bindAll(this);
    		
    		this.typeRadioEle = this.$el.find("#inputsetting_footer_setting_radio_group");
    		this.typeEditRadioEle = this.$el.find('#inputsetting_footer_setting_edit_radio');
    		this.typeDeleteRadioEle = this.$el.find('#inputsetting_footer_setting_delete_radio');
    		
    		this.selectedItemView = null;
    		
    		this.DeleteConfirmView = new ItemDeleteConfirmPopupView();
    		this.typeEditRadioEle.prop("checked" , true);
    		this.typeDeleteRadioEle.prop("checked" , false);
    		
    	},
    	init:function(){
    		this.$el.show();
    	},
    	reset:function(){
    		this.selectedItemView = null;
    		this.$el.hide();
    	},
    	touchItemView:function(itemView){
    		
    		this.selectedItemView = itemView;
    		logToConsole("項目選択 : " + this.selectedItemView.formitem.localId);
    		var fieldType = this.selectedItemView.formitem.FieldType;
    		var radioType = this.typeRadioEle.find("input:radio:checked").val();
    		logToConsole("タイプ : " + radioType);
    		
    		if(radioType == "edit"){
    			if(fieldType == "input"){
        			this.editInputItem();
        		}else if(fieldType == "label"){
        			this.editLabelItem();
        		}else if(fieldType == "button"){
        			this.editButtonItem();
        		}
    		}else if(radioType == "delete"){
    			if(fieldType == "input" || fieldType == "label"){
	        		var _this = this;
	    			this.DeleteConfirmView.open({
	        			ok:this.callbackDelete,
	        			cancel:function(){
	        				_this.DeleteConfirmView.close();
	        			}
	        		});
    			}
    		}
    		
    	},
    	
    	editInputItem:function(){
    		var _this = this;
    		var targetView = this.selectedItemView;
    		this.trigger( "itemsettingpopup" , 
    	    	function(result , value){
    				logToConsole("res ; " + result);
    				if(result == "save"){
    					_this.trigger( "updateinputitem" , _this.selectedItemView.formitem , value);
    				}
    			},
    			{mode:"edit" , 
    				type:"input" , 
    				field:targetView.fieldinfo, 
    				item:targetView.formitem
    			}
    		);
    	},
    	editLabelItem:function(){
    		var _this = this;
    		var targetView = this.selectedItemView;
    		this.trigger( "itemsettingpopup" , 
    	    	function(result , value){
    				logToConsole("res ; " + result);
    				if(result == "save"){
    					_this.trigger( "updatelabelitem" , _this.selectedItemView.formitem , value);
    				}
    			},
    			{mode:"edit" , 
    				type:"label" , 
    				item:targetView.formitem
    			}
    		);
    	},
    	editButtonItem:function(){
    		
    		/*
    		if(result == "save"){
				this.trigger( "updatebuttonitem" , this.selectedItemView.formitem , value);
			}*/
    	},
    	
    	callbackDelete:function(){
    		logToConsole("削除確定");
    		this.DeleteConfirmView.close();
    		var fieldType = this.selectedItemView.formitem.FieldType;
    		if(fieldType == "input"){
    			this.trigger( "deleteinputitem" , this.selectedItemView.formitem );
    		}else if(fieldType == "label"){
    			this.trigger( "deletelabelitem" , this.selectedItemView.formitem );
    		}
    	},
    	
		dispose:function(){
			//初期値を「編集」に戻しておく
			logToConsole("項目設定 : dispose");
			this.typeEditRadioEle.prop("checked" , true).checkboxradio("refresh");
    		this.typeDeleteRadioEle.prop("checked" , false).checkboxradio("refresh");
    	}
    });

    var EditAdditemView = Backbone.View.extend({
    	el:$("#inputsetting_footer_additem"),
    	events:{
    		"click #inputsetting_footer_additem_field_btn":"addField",
    		"click #inputsetting_footer_additem_label_btn":"addLabel",
    	},
    	initialize:function(){
    		_.bindAll( this );
    		this.selectedItem = {
    			type:"",
    			info:null
    		};
    		this.fieldSelectEle = this.$el.find("#inputsetting_footer_additem_field_select");
    	},
    	init:function(){
    		logToConsole("項目追加用 初期化");
    		var fieldList = LocalFormData.getSObjectFieldList();
    		var selectValue = "";
    		
    		var selectedMap = {};
    		_.each( FormItemList , function(f){
    			selectedMap[f.FieldName] = true;
    		});
    		var firstValue = this.fieldSelectEle.val();
    		if(firstValue != null && selectedMap[firstValue]){
    			firstValue = null;
    		}
    		_.each( fieldList , function(f){
    			if(!selectedMap[f.Name]){
    				selectValue += ('<option value="' + f.Name + '">' + escapeHTML( f.Label + "( "+f.Name +" )") + '</option>');
    	    		if(firstValue == null){
    	    			firstValue = f.Name;
    	    		}
    			}
    		});
    		
    		this.fieldSelectEle.children().remove();
    		this.fieldSelectEle.append(selectValue);
    		logToConsole(firstValue);
    		this.fieldSelectEle.val(firstValue);
    		this.fieldSelectEle.selectmenu('refresh' , true);
    		
    		this.$el.show();
    	},
    	
    	reset:function(){
    		this.$el.hide();
    	},
    	
    	addField:function(){
    		logToConsole("項目追加 : " + this.fieldSelectEle.val());
    		var field = LocalFormData.findSObjectField( this.fieldSelectEle.val() );
    		this.selectedItem.info = field;
    		this.trigger( "itemsettingpopup" , this.callbackInputItemSetting , {mode:"add" , type:"input" , field:field});
    	},
    	addLabel:function(){
    		logToConsole("ラベル追加");
    		this.trigger( "itemsettingpopup" , this.callbackLabelItemSetting , {mode:"add" , type:"label" });
    	},
    	
    	callbackInputItemSetting:function( result , value){
    		logToConsole("return : " + result);
    		logToConsole("value  : " + JSON.stringify(value));
    		if(result == "cancel"){
        		this.selectedItem.info = null;
    		}else if(result == "save"){
    			this.trigger( "addinputitem" , this.selectedItem.info , value );
        		this.selectedItem.info = null;
    		}
    	},
    	
    	callbackLabelItemSetting:function(result , value){
    		logToConsole("return : " + result);
    		logToConsole("value  : " + JSON.stringify(value));
    		if(result == "save"){
    			this.trigger( "addlabelitem" ,  value );
        	}
    	},
    	
    	touchItemView:function(itemView){
    		//特に何もしない
    	},
		dispose:function(){
			//特にやることない
		}
    });

    var EditBackgroundView = Backbone.View.extend({
    	el:$("#inputsetting_footer_background"),
    	events:{
    		"click #inputsetting_footer_background_bgfile_select":"clickFileSelect",
    		"change #inputsetting_footer_background_bgfile_check":"clickFileUse",
    		"change #inputsetting_footer_background_bgcolor":"changeBgColor"
    	},
    	initialize:function(){
    		
    		this.enableImageGroupEle = this.$el.find("#inputsetting_footer_background_bgfile_check_group");
    		this.enableImageCheckEle = this.$el.find("#inputsetting_footer_background_bgfile_check");
    		this.fileSelectBtnEle = this.$el.find("#inputsetting_footer_background_bgfile_select");
    		this.bgcolorEle = this.$el.find("#inputsetting_footer_background_bgcolor");
    		this.bgcolorEle.spectrum({
    			color: "#fff"
    		});
    		
    	},
    	init:function(){
    		//色設定
    		this.bgcolorEle.spectrum("set", FormDetail.backgroundcolor);
    		//ボタン表示設定
    		if(FormDetail.useImage){
    			this.enableImageFile();
    		}else{
    			this.disableImageFile();
    		}
    		this.$el.show();
    	},
    	reset:function(){
    		this.$el.hide();
    	},
    	
    	touchItemView:function(itemView){
    	},
    	
    	enableImageFile:function(){
    		this.enableImageGroupEle.find(".ui-btn-text").text("ON");
    		this.fileSelectBtnEle.button('enable');
    		this.enableImageCheckEle.prop("checked" , true);
    		this.enableImageCheckEle.checkboxradio("refresh");
    		logToConsole("画像有効化");
    	},
    	disableImageFile:function(){
    		this.enableImageGroupEle.find(".ui-btn-text").text("OFF");
    		this.fileSelectBtnEle.button('disable');
    		this.enableImageCheckEle.prop("checked" , false);
    		this.enableImageCheckEle.checkboxradio("refresh");
    		logToConsole("画像無効化");
    	},
    	
    	changeBgColor:function( e ){
    		logToConsole("change color!!");
    		var c = $(e.target).val();
    		logToConsole("color : " + c);
    		this.trigger("ChangeBgColor" , c.substring( 1 , c.length ));
    	},
    	clickFileUse:function( e ){
    		var checked = $(e.target).prop("checked");
    		logToConsole("val : " + checked);
    		if(checked){
    			this.enableImageFile();
    		}else{
    			this.disableImageFile();
    		}
    		FormDetail.useImage = checked;
    		this.trigger("ChangeImageActive" );
    	},
    	clickFileSelect:function(){
    		
    		logToConsole("click file select!!");
    		
    		var _this = this;
    		var onSuccess = function(imageData){
    			logToConsole("画像読み込み成功！！ : " + imageData.length);
    			LocalFormData.setInputBgImageData( imageData );
    			//この場で直接書き換える
    			_this.backgroundEle.css("background-image", "url(data:image/jpeg;base64,"+ imageData + ")");
    		}
    		var onFail = function(){
    			logToConsole("読み込みエラー");
    		}
    		
    		//camera API を利用して画像を読み込む
    		navigator.camera.getPicture(onSuccess, onFail, 
    				{ quality: 50, 
    			      destinationType: navigator.camera.DestinationType.DATA_URL ,
    			      sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM ,
    			      encodingType:"JPEG"
    				}
    		);
    	},
		dispose:function(){
			//特にやることない
		}
    });

    var ItemSettingPopup = Backbone.View.extend({
    	el:$("#inputsetting_itemsetting_popup"),
    	events:{
    		"click #inputsetting_itemsetting_buttons_save_btn":"clickSave",
    		"click #inputsetting_itemsetting_buttons_cancel_btn":"clickCancel"
    	},
    	initialize:function(){
    		
    		this.validateFunc = null;
    		this.getValueFunc = null;
    		this.callbackFunc = null;
    		
    		this.InputEle = this.$el.find("#inputsetting_itemsetting_input_div");
    		this.LabelEle = this.$el.find("#inputsetting_itemsetting_label_div");
    		
    		this.InputDetailEles = {
    			field:{
    				label:this.$el.find("#inputsetting_itemsetting_input_fieldlabel"),
    				name:this.$el.find("#inputsetting_itemsetting_input_fieldname"),
    				nillable:this.$el.find("#inputsetting_itemsetting_input_fieldnillable")
    			},
    			text:{
    				div:this.$el.find("#inputsetting_itemsetting_input_text_div") ,
    				label:this.$el.find("#inputsetting_itemsetting_input_text_label") ,
    				placeholder:this.$el.find("#inputsetting_itemsetting_input_text_placeholder") ,
    				require:this.$el.find("#inputsetting_itemsetting_input_text_require") 
    			},
    			textarea:{
    				div:this.$el.find("#inputsetting_itemsetting_input_textarea_div") ,
    			},
    			picklist:{
    				div:this.$el.find("#inputsetting_itemsetting_input_picklist_div") , 
    			},
    			multipicklist:{
    				div:this.$el.find("#inputsetting_itemsetting_input_multipicklist_div")
    			}
    		};
    		
    		this.LabelDetailEles = {
    			label:this.$el.find("#inputsetting_itemsetting_label_label"),
    			color:this.$el.find("#inputsetting_itemsetting_label_color"),
    			size:this.$el.find("#inputsetting_itemsetting_label_size"),
    			labelerror:this.$el.find("#inputsetting_itemsetting_label_label_inputerror")
    		}
    		this.LabelDetailEles.color.spectrum({
    			color: "#000"
    		});
    		
    	},
    	reset:function(){
    		
    		this.InputDetailEles.text.div.hide();
    		this.InputDetailEles.textarea.div.hide();
    		this.InputDetailEles.picklist.div.hide();
    		this.InputDetailEles.multipicklist.div.hide();
    		
    		this.InputEle.hide();
    		this.LabelEle.hide();
    		
    	},
    	show:function(callback , param){
    		
    		logToConsole("show popup");
    		this.reset();
    		
    		//追加か編集か
    		var mode = param.mode;
    		var formitem = null;
    		if(mode == "edit"){
    			formitem = param.item;
    		}
    		
    		var type = param.type;
    		if(type == "input"){
    			
    			this.InputEle.show();
        		var fieldInfo = param.field;
        		logToConsole(fieldInfo);
        		//項目情報設定
        		this.InputDetailEles.field.label.text(fieldInfo.Label);
        		this.InputDetailEles.field.name.text(fieldInfo.Name);
        		this.InputDetailEles.field.nillable.text( fieldInfo.Nillable ? "任意" : "必須" );
        		
    			if( fieldInfo.Type ==  SFFieldDefine.TYPE.MULTIPICKLIST){
    				this.setupInputMultipicklist(fieldInfo , formitem);
    			}else if( fieldInfo.Type ==  SFFieldDefine.TYPE.PICKLIST ){
    				this.setupInputPicklist(fieldInfo , formitem);
    			}else if( fieldInfo.Type ==  SFFieldDefine.TYPE.TEXTAREA ){
    				this.setupInputTextarea(fieldInfo , formitem);
    			}else{
    		    	this.setupInputText(fieldInfo , formitem);
    			}
        		
    		}else if(type == "label"){
    			this.LabelEle.show();
    			this.setupLabel( formitem );
    		}
    	
    		this.callbackFunc = callback;
    		this.$el.popup("open");
    	},
    	
    	setupInputText:function(fieldInfo , formitem){
    		
    		logToConsole("text系項目の設定準備");
    		var textDefine = this.InputDetailEles.text;
    		if(formitem != null){
    			textDefine.label.val(formitem.Label);
    			textDefine.placeholder.val(formitem.Placeholder);
    			textDefine.require.prop("checked", formitem.Require );
    			textDefine.require.checkboxradio("refresh");
    		}else{
    			textDefine.label.val(fieldInfo.Label);
    			textDefine.placeholder.val("");
    			textDefine.require.prop("checked", false );
    			textDefine.require.checkboxradio("refresh");
    		}
    		
    		this.validateFunc = this.validateInputText;
    		this.getValueFunc = this.getInputText;
    		textDefine.div.show();
    	},
    	setupInputTextarea:function(){
    		
    	},
    	setupInputPicklist:function(){
    		
    	},
    	setupInputMultipicklist:function(){
    		
    	},
    	setupLabel:function( formitem ){
    		
    		logToConsole("ラベル項目の設定準備");
    		if(formitem != null){
    			this.LabelDetailEles.label.val( formitem.Label );
    			if(formitem.TextColor != null){
    				this.LabelDetailEles.color.spectrum("set", formitem.TextColor );
    			}else{
    				this.LabelDetailEles.color.spectrum("set", "000" );
    			}
    			if(formitem.TextSize != null){
    				this.LabelDetailEles.size.val( formitem.TextSize );
    			}else{
    				this.LabelDetailEles.size.val( 1 );
    			}
    		}else{
    			this.LabelDetailEles.label.val( "" );
    			this.LabelDetailEles.color.spectrum("set", "000" );
    			this.LabelDetailEles.size.val( 1 );
    		}
    		
    		this.LabelDetailEles.size.selectmenu( "refresh" , true );
    		
    		this.LabelDetailEles.labelerror.hide();
    		
    		this.validateFunc = this.validateLabel;
    		this.getValueFunc = this.getLabel;
    		
    	},
    	
    	validateInputText:function(){
    		return true;
    	},
    	validateInputTextarea:function(){
    		return true;
    	},
    	validateInputPicklist:function(){
    		return true;
    	},
    	validateInputMultipicklist:function(){
    		return true;
    	},
    	validateLabel:function(){
    		
    		var label = this.LabelDetailEles.label.val();
    		if(isEmpty(label)){
    			this.LabelDetailEles.labelerror.show();
    			return false;
    		}
    		return true;
    	},
    	
    	getInputText:function(){
    		
    		var textDefine = this.InputDetailEles.text;
    		var resValue = {};
    		resValue.Label = textDefine.label.val();
    		resValue.Placeholder = textDefine.placeholder.val();
    		
    		resValue.Require = textDefine.require.prop("checked");
    		
    		if(resValue.Label == null){
    			resValue.Label = "";
    		}
    		if(resValue.Placeholder == null){
    			resValue.Placeholder = "";
    		}
    		
    		return resValue;
    		
    	},
    	getInputTextarea:function(){
    		
    	},
    	getInputPicklist:function(){
    		
    	},
    	getInputMultipicklist:function(){
    		
    	},
    	getLabel:function(){
    		var resValue = {};
    		resValue.Label = this.LabelDetailEles.label.val();
    		resValue.TextColor = this.LabelDetailEles.color.val();
    		resValue.TextColor = resValue.TextColor.substring(1 , resValue.TextColor.length);
    		resValue.TextSize  = this.LabelDetailEles.size.val();
    		return resValue;
    	},
    	
    	clickSave:function(){
    		logToConsole("決定ボタン押した");
    		if( !this.validateFunc() ){
    			return false;
    		}
    		logToConsole("validate通過" );
    		this.callbackFunc("save" , this.getValueFunc());
    		this.close();
    	},
    	clickCancel:function(){
    		logToConsole("キャンセルボタン押した");
    		this.callbackFunc("cancel");
    		this.close();
    	},
    	close:function(){
    		try{
    			this.$el.popup("close");
    		}catch( e ){
    		}
    	},
		dispose:function(){
			//特にやることない
		}
    });
        	
	var BaseSettingFormItemView = viewDefine.BaseFormItemView.extend({
		MIN_WIDTH:50,
		MIN_HEIGHT:50,
		events:{
			"touchstart .pointer1":"touchLeftTopPoint",
			"touchmove .pointer1":"touchLeftTopPoint",
			"touchend .pointer1":"touchLeftTopPoint",
			"touchstart .pointer2":"touchRightBottomPoint",
			"touchmove .pointer2":"touchRightBottomPoint",
			"touchend .pointer2":"touchRightBottomPoint",
			"touchstart .center_point":"touchCenterPoint",
			"touchmove .center_point":"touchCenterPoint",
			"touchend .center_point":"touchCenterPoint",
			"touchstart .setting_mask":"touchSettingMask"
		},
		
		initialize:function(){
			_.bindAll(this);
			this.indexX = 0;
			this.indexY = 0;
			this.initX = 0;
			this.initY = 0;
			this.initWidth  = 0;
			this.initHeight = 0;
		},
		renderAdd:function(){
			//左上のポインタ
			this.$el.append('<div class="pointer1" ' + 
			        'style="background-color:#11dd00; ' + 
			        'position:absolute; left:0px; top:0px; ' + 
					'width:25px; height:25px; opacity:0.5;"/>' );
			//右下のポインタ
			this.$el.append('<div class="pointer2" ' + 
					        'style="background-color:#11dd00; ' + 
					        'position:absolute; right:0px; bottom:0px; ' + 
					        'width:25px; height:25px; opacity:0.5;" />' );
			
			//真ん中のポインタ
			this.$el.append('<div class="center_point" ' + 
					        'style="background-color:#000000; ' + 
					        'position:absolute; top:50%; left:50%; ' +
					        'margin:-13px 0 0 -13px;' +
					        'width:26px; height:26px; opacity:0.5;" />' );
			
			//全体マスク
			this.$el.append('<div class="setting_mask" ' + 
			        'style="background-color:#000000; ' + 
			        'position:absolute; top:0px; left:0px; ' + 
			        'width:100%; height:100%; opacity:0.3;" />' );
			
			this.positionPoint1 = this.$el.find(".pointer1");
			this.positionPoint2 = this.$el.find(".pointer2");
			this.positionCenter = this.$el.find(".center_point");
			
			this.settingMask = this.$el.find(".setting_mask");
			
			this.resetRenderOption();
			
		},
		resetRenderOption:function(){
			logToConsole("reset render option");
			
			this.$el.css("border" , "0px");
			this.$el.css("margin" , "0px");
			this.positionPoint1.hide();
			this.positionPoint2.hide();
			this.positionCenter.hide();
			
			this.settingMask.hide();
			
		},
		renderPosition:function(){
			
			logToConsole("render position option");
			
			this.$el.css("border" , "1px solid green");
			this.$el.css("margin" , "-1px");
			this.positionPoint1.show();
			this.positionPoint2.show();
			this.positionCenter.show();
			
		},
		renderSetting:function(){
			
			logToConsole("render setting option");
			
			this.$el.css("border" , "3px solid green");
			this.$el.css("margin" , "-3px");
			
			this.settingMask.show();
			
		},

		updatePosition:function(pos){
			var windowWidth = getWindowWidth();
			var windowHeight = getWindowHeight();
			
			if(pos.Width > windowWidth){
				pos.Width = windowWidth;
			}
			if(pos.Width < 1){
				pos.Width = 1;
			}
			if(pos.Height > windowHeight){
				pos.Height = windowHeight;
			}
			if(pos.Height < 1){
				pos.Height = 1;
			}
			if((pos.X + pos.Width) > windowWidth){
				pos.X = windowWidth - pos.Width;
			}
			if( pos.X < 0){
				pos.X = 0;
			}
			if((pos.Y + pos.Height) > windowHeight){
				pos.Y = windowHeight - pos.Height;
			}
			if( pos.Y < 0){
				pos.Y = 0;
			}
			
			//logToConsole(JSON.stringify(pos));
			this.formitem.PosX = pos.X;
			this.formitem.PosY = pos.Y;
			this.formitem.Width = pos.Width;
			this.formitem.Height = pos.Height;
			this.setPosition();
		},
		
		touchLeftTopPoint:function(e){
			
			e.preventDefault();
			//タッチ位置取得(でも結構ずれてる)
			var touch = e.originalEvent.touches[0];
			var $parent = this.$el;
			if(e.type == "touchstart"){
				//タッチ開始時に基準の位置とサイズを取得
				this.indexX = touch.pageX;
				this.indexY = touch.pageY;
				this.initX  = $parent.position().left;
				this.initY  = $parent.position().top;
				this.initWidth  = $parent.width();
				this.initHeight = $parent.height();
				
				this.updatePosition({
					X:this.initX, 
					Y:this.initY, 
					Width:this.initWidth, 
					Height:this.initHeight
				});
				
			}else if(e.type == "touchmove"){
				
				//最新のタッチ位置
				var nowX = touch.pageX;
				var nowY = touch.pageY;
				var diffX = this.indexX - nowX;
				var diffY = this.indexY - nowY;
				
				if(this.formitem.HorizontalCenter){
					diffX *= 2;
				}
				
				var _width  = (this.initWidth  + diffX);
				var _height = (this.initHeight + diffY);
				var _X      = (this.initX      - diffX);
				var _Y      = (this.initY      - diffY);
				
				if(_width < this.MIN_WIDTH){
					_X = $parent.position().left;
					_width = this.MIN_WIDTH;
				}
				if(_height < this.MIN_HEIGHT){
					_Y = $parent.position().top;
					_height = this.MIN_HEIGHT;
				}
				
				this.updatePosition({
					X:_X, 
					Y:_Y, 
					Width:_width, 
					Height:_height
				});
				
			}else if(e.type == "touchend"){
				
				this.updatePosition({
					X:$parent.position().left, 
					Y:$parent.position().top, 
					Width:$parent.width(), 
					Height:$parent.height()
				});
				
			}
			
			this.model.trigger("touch" , this);
		
		},
		
		touchRightBottomPoint:function(e){
			e.preventDefault();
			//タッチ位置取得(でも結構ずれてる)
			var touch = e.originalEvent.touches[0];
			var $parent = this.$el;
			if(e.type == "touchstart"){
				//タッチ開始時に基準の位置とサイズを取得
				this.indexX = touch.pageX;
				this.indexY = touch.pageY;
				this.initWidth  = $parent.width();
				this.initHeight = $parent.height();
				this.initX  = $parent.position().left ;
				this.initY  = $parent.position().top  ;
				
				this.updatePosition({
					X:this.initX, 
					Y:this.initY, 
					Width:this.initWidth, 
					Height:this.initHeight
				});
				
			}else if(e.type == "touchmove"){
				
				//最新のタッチ位置
				var nowX = touch.pageX;
				var nowY = touch.pageY;
				var diffX = this.indexX - nowX;
				var diffY = this.indexY - nowY;
				
				if(this.formitem.HorizontalCenter){
					diffX *= 2;
				}
				
				var _width  = (this.initWidth  - diffX);
				var _height = (this.initHeight - diffY);
				var _X   = (this.initX);
				var _Y   = (this.initY);
				
				if(_width < this.MIN_WIDTH){
					_width = this.MIN_WIDTH;
				}
				if(_height < this.MIN_HEIGHT){
					_height = this.MIN_HEIGHT;
				}
				
				this.updatePosition({
					X:_X, 
					Y:_Y, 
					Width:_width, 
					Height:_height
				});
				
			}else if(e.type == "touchend"){
				
				this.updateModel({
					X:$parent.position().left, 
					Y:$parent.position().top, 
					Width:$parent.width(), 
					Height:$parent.height()
				});
				
			}
			
			this.model.trigger("touch" , this);
		
		},
		
		touchCenterPoint:function( e ){
			
			e.preventDefault();
			//タッチ位置取得(でも結構ずれてる)
			var touch = e.originalEvent.touches[0];
			var $parent = this.$el;
			if(e.type == "touchstart"){
				//タッチ開始時に基準の位置とサイズを取得
				this.indexX = touch.pageX;
				this.indexY = touch.pageY;
				this.initWidth  = $parent.width();
				this.initHeight = $parent.height();
				this.initX  = $parent.position().left ;
				this.initY  = $parent.position().top  ;
			}else if(e.type == "touchmove"){
				
				//最新のタッチ位置と開始時との差分
				var diffX = this.indexX - touch.pageX;
				var diffY = this.indexY - touch.pageY;
				var _X   = (this.initX - diffX);
				var _Y   = (this.initY - diffY);
				this.updatePosition({
					X:_X, 
					Y:_Y, 
					Width:$parent.width(), 
					Height:$parent.height()
				});
				
			}else if(e.type == "touchend"){
				
			}
			this.model.trigger("touch" , this);
		},
		
		touchSettingMask:function( e ){
			logToConsole("setting touch");
			e.preventDefault();
			this.model.trigger("touch" , this);
		}
		
	});
	
	var TextLabelFormItemView = BaseSettingFormItemView.extend({
		tmpl:BaseTextLabelFormItemView.prototype.tmpl,
		render:function(){
			logToConsole("setting textlabel render ");
			BaseTextLabelFormItemView.prototype.render.call(this);
			BaseSettingFormItemView.prototype.renderAdd.call(this);
			logToConsole("setting textlabel render end");
			return this;
		},
		setPosition:BaseTextLabelFormItemView.prototype.setPosition
	});

	var SubmitButtonFormItemView = BaseSettingFormItemView.extend({
		tmpl:BaseSubmitButtonFormItemView.prototype.tmpl,
		render:function(){
			logToConsole("setting submitbutton render ");
			BaseSubmitButtonFormItemView.prototype.render.call(this);
			BaseSettingFormItemView.prototype.renderAdd.call(this);
			logToConsole("setting submitbutton render end");
			return this;
		},
		setPosition:BaseSubmitButtonFormItemView.prototype.setPosition,
		disableClick:BaseSubmitButtonFormItemView.prototype.disableClick
	});

	var StringInputFormItemView = BaseSettingFormItemView.extend({
		tmpl:BaseStringInputFormItemView.prototype.tmpl,
		render:function(){
			logToConsole("setting string render ");
			BaseStringInputFormItemView.prototype.render.call(this);
			BaseSettingFormItemView.prototype.renderAdd.call(this);
			this.$el.find("input").prop("disabled" , true);
			logToConsole("setting string render end");
			return this;
		},
		setPosition:BaseInputFormItemView.prototype.setPosition
	});
	
	var MailAddressInputFormItemView = BaseSettingFormItemView.extend({
		tmpl:BaseMailAddressInputFormItemView.prototype.tmpl,
		render:function(){
			logToConsole("setting email render ");
			BaseMailAddressInputFormItemView.prototype.render.call(this);
			BaseSettingFormItemView.prototype.renderAdd.call(this);
			this.$el.find("input").prop("disabled" , true);
			logToConsole("setting email render end");
			return this;
		},
		setPosition:BaseInputFormItemView.prototype.setPosition
	});
	
	/*
	
	var StringFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_string_input").html()),
		initialize:function(){
		},
		render:function(){
			logToConsole("stringview render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			this.$el.css("width"  , this.model.itemsetting.Width__c + "px");
			this.$el.css("height" , this.model.itemsetting.Height__c + "px");
			this.$el.css("top"    , this.model.itemsetting.PosY__c + "px");
			this.$el.css("left"   , this.model.itemsetting.PosX__c + "px");
			this.$el.css("position","absolute");
			this.$el.css("border" , "2px solid green");
			//this.$el.css("z-index" , "99999");
			BaseFieldView.prototype.render.call(this);
			return this;
		},
		refresh:function(){
			BaseFieldView.prototype.refresh.call(this);
			this.$el.find("input").textinput();
			this.$el.find("input").prop("disabled" , true);
			logToConsole("stringview render end");
		}
	});

	var TextAreaFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_textarea_input").html()),
		initialize:function(){
		},
		render:function(){
			logToConsole("textare view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("textarea").textinput();
			logToConsole("textarea view render end");
		}
	});
	
	var IntegerFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_integer_input").html()),
		render:function(){
			logToConsole("integer view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("input").textinput();
			logToConsole("integer view render end");
		}
	});

	var DoubleFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_double_input").html()),
		render:function(){
			logToConsole("double view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("input").textinput();
			logToConsole("double view render end");
		}
	});
	
	var PhoneFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_phone_input").html()),
		render:function(){
			logToConsole("phone view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("input").textinput();
			logToConsole("phone view render end");
		}
	});
	
	var UrlFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_url_input").html()),
		render:function(){
			logToConsole("url view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("input").textinput();
			logToConsole("url view render end");
		}
	});

	var DateFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_date_input").html()),
		render:function(){
			logToConsole("date view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("input").textinput();
			logToConsole("date view render end");
		}
	});

	var DateTimeFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_datetime_input").html()),
		render:function(){
			logToConsole("datetime view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("input").textinput();
			logToConsole("datetime view render end");
		}
	});
	
	var PicklistFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_picklist_input").html()),
		render:function(){
			logToConsole("picklist view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("select").selectmenu();
			logToConsole("picklist view render end");
		}
	});	
	
	var PicklistRadioFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_picklistradio_input").html()),
		render:function(){
			logToConsole("picklistradio view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("input").checkboxradio();
			logToConsole("picklistradio view render end");
		}
	});
	
	var MultiPicklistFieldView = BaseFieldView.extend({
		tmpl:_.template($("#inputsetting_multipicklist_input").html()),
		render:function(){
			logToConsole("multipicklist view render");
			this.$el.html(this.tmpl(this.model.itemsetting));
			return this;
		},
		refresh:function(){
			this.$el.find("select").selectmenu();
			logToConsole("multipicklist view render end");
		}
	});

	/*
	var InputSetting_InputFieldModel = modelDefine.InputFieldModel.extend({
		init:function(){
			modelDefine.InputFieldModel.prototype.init.call(this);
			this.localModel = JSON.parse(JSON.stringify(this.itemsetting));
		}
	});
	var InputSetting_InputFieldCollection = modelDefine.InputFieldCollection;
*/

	
	/*
	function createInputFormItemView( m ){
		
		logToConsole("createInputFormItemView ");
		var field   = m.get("fieldinfo");
		var setting = m.get("inputsetting");
		var type = field.Type;
		logToConsole("type :" + type);
		if(type == SFFieldDefine.TYPE.STRING){
			return new StringInputFormItemView();
		}
		
		else if(type == "textarea"){
				return new TextAreaFieldView({model:item});
		}else if(type == "email"){
			return new MailAddressFieldView({model:item});
		}else if(type == "integer"){
			return new IntegerFieldView({model:item});
		}else if(type == "double"){
			return new DoubleFieldView({model:item});
		}else if(type == "url"){
			return new UrlFieldView({model:item});
		}else if(type == "phone"){
			return new PhoneFieldView({model:item});
		}else if(type == "picklist"){
			if(item.itemsetting.isRadio){
				return new PicklistRadioFieldView({model:item});
			}else{
				return new PicklistFieldView({model:item});
			}
		}else if(type == "multipicklist"){
			return new MultiPicklistFieldView({model:item});
		}else if(type == "date"){
			return new DateFieldView({model:item});
		}else if(type == "datetime"){
			return new DateTimeFieldView({model:item});
		}
	}*/
	
	this.InputSettingPageView = InputSettingPageView;

	logToConsole("InputSettingPage:init完了");

}