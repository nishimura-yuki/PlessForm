function initFinishSettingPage( modelDefine , datas , viewDefine) {

	logToConsole("FinishSettingPage:init開始");

	var FormData = datas.FormData;
	var FormListData = datas.FormListData;
	var AppData = datas.AppData;
	
	var LocalFormData = {};
	var FormDetail = {};
	var FormItemList = [];
	
	//View定義情報設定
	var BaseFinishContentView = viewDefine.BaseFinishContentView;
	var BaseTextLabelFormItemView = viewDefine.TextLabelFormItemView;
	var SimplePopupView = viewDefine.SimplePopupView;
	
	//Model定義情報設定
	var LabelFormItemModel = modelDefine.LabelFormItemModel;	
	var LabelFormItemCollection = modelDefine.LabelFormItemCollection;
	
	//入力画面設定全体のView
    var FinishSettingPageView = Backbone.View.extend({
    	el:$("#finishsetting"),
		events:{
			"click #finishsetting_header_backbtn":"clickReturn",
			"click #finishsetting_header_savebtn":"clickSave",
			"click .footer_navi":"clickEditMode" ,
		},
		
		initialize:function(){
			
			logToConsole("finishsetting ページビュー初期化");
			
			_.bindAll(this);
			
			this.returnWindow = "";
			
			//子View
			this.contentView = new ContentView();
			this.itemsettingPopup = new ItemSettingPopup();
			this.savePopup   = new SaveConfirmPopupView();
			this.returnPopup = new ReturnConfirmPopupView();
			
			//画面サイズを指定（余白をクリア 無理矢理）
			this.contentEle = this.$el.find("#finishsetting_content");
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
			this.listenTo(this.editAdditemView    , "addlabelitem" , this.eventAddLabelFormItem);
			
			//項目削除のイベント
			this.listenTo(this.editSettingView    , "deletelabelitem" , this.eventDeleteLabelFormItem);
			
			//項目編集のイベント
			this.listenTo(this.editSettingView    , "updatelabelitem" , this.eventUpdateLabelFormItem);
			
			//画像選択時のイベント
			//this.listenTo(this.editBackgroundView , "selectBgImage" , this.eventSelectBgImage);
			this.editBackgroundView.backgroundEle = this.contentView.$el;
			
			//画像有効無効変更時のイベント
			this.listenTo(this.editBackgroundView , "ChangeImageActive" , this.eventChangeImageActive);
			
			//背景色更新時のイベント
			this.listenTo(this.editBackgroundView , "ChangeBgColor" , this.eventChangeBgColor);
			
			//フッター部分
			this.footer = this.$el.find("#finishsetting_footer");
			this.footerNavi = this.$el.find("#finishsetting_footer_navi");
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
				_this.changeEditMode("finishsetting_footer_navi_position");
			}
			
			if(args.form != null){
				
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
			FormDetail = LocalFormData.getFormDetail().finish;
			FormItemList = LocalFormData.getFormItemList().finish;
			
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
				var tmpModel = new LabelFormItemModel({ labelsetting:f });
				_this.contentView.addLabelModel( tmpModel );
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
			if( targetId == "finishsetting_footer_navi_position"){
				nextView = this.editPositionView;
				refreshFunc = this.contentView.refreshPositionMode;
			}else if( targetId == "finishsetting_footer_navi_setting"){
				nextView = this.editSettingView;
				refreshFunc = this.contentView.refreshSettingMode;
			}else if( targetId == "finishsetting_footer_navi_additem"){
				nextView = this.editAdditemView;
				refreshFunc = this.contentView.refreshAdditemMode;
			}else if( targetId == "finishsetting_footer_navi_background"){
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
				FormData.getFinishBgImageData() != LocalFormData.getFinishBgImageData()){
				
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
				if( LocalFormData.getFinishBgImageData() == null){
					FormDetail.useImage = false;
				}
			}else{
				if( LocalFormData.getFinishBgImageData() != null){
					LocalFormData.setFinishBgImageData(null);
				}
			}
			
			//入力画面の画像まで再保存するのは無駄なので
			//nullをセットしておく
			LocalFormData.setInputBgImageData(null);
			
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

		eventAddLabelFormItem:function(values){
			values.HorizontalCenter = true;
			values.PosX   = 0;
			values.PosY   = (getWindowHeight() / 2 - 40);
			values.Width  = (getWindowWidth() / 2);
			values.Height = 80;
			LocalFormData.addFormItemToFinish( LocalFormData.getLabelFormitemTemplate(values) );
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
			LocalFormData.updateFormItemToFinish( item );
			this.refreshWindow();
		},

		eventDeleteLabelFormItem:function(item){
			logToConsole("label項目削除");
			LocalFormData.deleteFormItemToFinish( item );
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

	var ContentView = BaseFinishContentView.extend({
		el:$("#finishsetting_content_inner"),
		events:{
		},
		initialize:function () {
			BaseFinishContentView.prototype.initialize.call(this);
			_.bindAll(this);
			this.$el.css("width"  , getWindowWidth() + "px");
			this.$el.css("height" , getWindowHeight() + "px");
		},

		resetEditRender:function(){
			logToConsole("編集用の描画をリセット");
			_(this.labelViews).each(function(view) {
				view.resetRenderOption();
			});
		},
		
		refreshPositionMode:function(){
			logToConsole("配置設定用に更新");
			this.resetEditRender();
			_(this.labelViews).each(function(view) {
				view.renderPosition();
			});
		},
		refreshSettingMode:function(){
			logToConsole("項目設定用に更新");
			this.resetEditRender();
			_(this.labelViews).each(function(view) {
				view.renderSetting();
			});
		},
		refreshAdditemMode:function(){
			logToConsole("項目追加用に更新");
			this.resetEditRender();
		},
		refreshBackgroundMode:function(){
			logToConsole("背景設定用に更新");
			this.resetEditRender();
		},

		createTextLabelFormItemView:function(){
			return new TextLabelFormItemView();
		},
		
	});
    

	var SaveConfirmPopupView = SimplePopupView.extend({
		el:$("#finishsetting_saveconfirm_popup"),
		events:{
    		"click #finishsetting_saveconfirm_save":"clickOk",
    		"click #finishsetting_saveconfirm_cancel":"clickCancel"
    	}
	});
	
	var ReturnConfirmPopupView = SimplePopupView.extend({
		el:$("#finishsetting_returnconfirm_popup"),
		events:{
    		"click #finishsetting_returnconfirm_return":"clickOk",
    		"click #finishsetting_returnconfirm_cancel":"clickCancel",
    		"click #finishsetting_returnconfirm_save":"clickOther"
    	}
	});
	
    var ItemDeleteConfirmPopupView =  SimplePopupView.extend({
    	el:$("#finishsetting_itemdeleteconfirm_popup"),
    	events:{
    		"click #finishsetting_itemdeleteconfirm_delete":"clickOk",
    		"click #finishsetting_itemdeleteconfirm_cancel":"clickCancel"
    	}
    });
    
    
    var EditPositionView = Backbone.View.extend({
    	el:$("#finishsetting_footer_position"),
    	events:{
    		"click #finishsetting_formitem_pos_btn":"clickPositionUpdate",
    		"change #finishsetting_footer_position_center_check":"changeCenterCheck"
    	},
    	initialize:function(){
    		
    		//配置設定関連
			this.selectedItemView = null;
			this.xposEle   = this.$el.find("#finishsetting_formitem_xpos");
			this.yposEle   = this.$el.find("#finishsetting_formitem_ypos");
			this.widthEle  = this.$el.find("#finishsetting_formitem_width");
			this.heightEle = this.$el.find("#finishsetting_formitem_height");
			this.centerEle = this.$el.find("#finishsetting_footer_position_center_check");
			
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
    	el:$("#finishsetting_footer_setting"),
    	initialize:function(){
    		
    		_.bindAll(this);
    		
    		this.typeRadioEle = this.$el.find("#finishsetting_footer_setting_radio_group");
    		this.typeEditRadioEle = this.$el.find('#finishsetting_footer_setting_edit_radio');
    		this.typeDeleteRadioEle = this.$el.find('#finishsetting_footer_setting_delete_radio');

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
    			this.editLabelItem();
    		}else if(radioType == "delete"){
    			var _this = this;
	    		this.DeleteConfirmView.open({
	        		ok:this.callbackDelete,
	        		cancel:function(){
	        			_this.DeleteConfirmView.close();
	        		}
	        	});
    		}
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
    				item:targetView.formitem
    			}
    		);
    	},

    	callbackDelete:function(){
    		logToConsole("削除確定");
    		this.DeleteConfirmView.close();
    		this.trigger( "deletelabelitem" , this.selectedItemView.formitem );
    	},
    	
		dispose:function(){
			//初期値を「編集」に戻しておく
			logToConsole("項目設定 : dispose");
			this.typeEditRadioEle.prop("checked" , true).checkboxradio("refresh");
    		this.typeDeleteRadioEle.prop("checked" , false).checkboxradio("refresh");
    		
		}
    });

    var EditAdditemView = Backbone.View.extend({
    	el:$("#finishsetting_footer_additem"),
    	events:{
    		"click #finishsetting_footer_additem_label_btn":"addLabel",
    	},
    	initialize:function(){
    		_.bindAll( this );
    	},
    	init:function(){
    		logToConsole("項目追加用 初期化");
    		this.$el.show();
    	},
    	
    	reset:function(){
    		this.$el.hide();
    	},

    	addLabel:function(){
    		logToConsole("ラベル追加");
    		this.trigger( "itemsettingpopup" , this.callbackItemSetting , {mode:"add"});
    	},
    	
    	callbackItemSetting:function( result , value){
    		logToConsole("return : " + result);
    		if(result == "save"){
    			this.trigger( "addlabelitem" , value );
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
    	el:$("#finishsetting_footer_background"),
    	events:{
    		"click #finishsetting_footer_background_bgfile_select":"clickFileSelect",
    		"change #finishsetting_footer_background_bgfile_check":"clickFileUse",
    		"change #finishsetting_footer_background_bgcolor":"changeBgColor"
    	},
    	initialize:function(){
    		
    		this.enableImageGroupEle = this.$el.find("#finishsetting_footer_background_bgfile_check_group");
    		this.enableImageCheckEle = this.$el.find("#finishsetting_footer_background_bgfile_check");
    		this.fileSelectBtnEle = this.$el.find("#finishsetting_footer_background_bgfile_select");
    		this.bgcolorEle = this.$el.find("#finishsetting_footer_background_bgcolor");
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
    			LocalFormData.setFinishBgImageData( imageData );
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
    	el:$("#finishsetting_itemsetting_popup"),
    	events:{
    		"click #finishsetting_itemsetting_buttons_save_btn":"clickSave",
    		"click #finishsetting_itemsetting_buttons_cancel_btn":"clickCancel"
    	},
    	initialize:function(){
    		
    		this.callbackFunc = null;
    		this.LabelDetailEles = {
    			label:this.$el.find("#finishsetting_itemsetting_label_label"),
    			color:this.$el.find("#finishsetting_itemsetting_label_color"),
    			size:this.$el.find("#finishsetting_itemsetting_label_size"),
    			labelerror:this.$el.find("#finishsetting_itemsetting_label_label_inputerror")
    		}
    		this.LabelDetailEles.color.spectrum({
    			color: "#000"
    		});
    		
    	},

    	show:function(callback , param){
    		
    		logToConsole("show popup");
    		
    		//追加か編集か
    		var mode = param.mode;
    		var formitem = null;
    		if(mode == "edit"){
    			formitem = param.item;
    		}
    		this.setupLabel( formitem );
    		
    		this.callbackFunc = callback;
    		this.$el.popup("open");
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

    	validate:function(){
    		
    		var label = this.LabelDetailEles.label.val();
    		if(isEmpty(label)){
    			this.LabelDetailEles.labelerror.show();
    			return false;
    		}
    		return true;
    	},

    	getLabelValue:function(){
    		var resValue = {};
    		resValue.Label = this.LabelDetailEles.label.val();
    		resValue.TextColor = this.LabelDetailEles.color.val();
    		resValue.TextColor = resValue.TextColor.substring(1 , resValue.TextColor.length);
    		resValue.TextSize  = this.LabelDetailEles.size.val();
    		return resValue;
    	},
    	
    	clickSave:function(){
    		logToConsole("決定ボタン押した");
    		if( !this.validate() ){
    			return false;
    		}
    		logToConsole("validate通過" );
    		this.callbackFunc("save" , this.getLabelValue());
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
	
	this.FinishSettingPageView = FinishSettingPageView;

	logToConsole("FinishSettingPage:init完了");

}