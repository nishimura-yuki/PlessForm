
function initMainFormPage( modelDefine , datas , viewDefine ) {

	logToConsole("MainFormPage:init開始");

	var FormData = datas.FormData;
	var FormListData = datas.FormListData;
	var AppData = datas.AppData;
	
	//SFDCに送信するデータのモデル
	var CreateModel = null;
	
	//View定義情報設定
	var BaseInputContentView = viewDefine.BaseInputContentView;
	var BaseFinishContentView = viewDefine.BaseFinishContentView;
	var TextLabelFormItemView = viewDefine.TextLabelFormItemView;
	var SubmitButtonFormItemView = viewDefine.SubmitButtonFormItemView;
	var MailAddressInputFormItemView = viewDefine.MailAddressInputFormItemView;
	var StringInputFormItemView = viewDefine.StringInputFormItemView;
	var SimplePopupView = viewDefine.SimplePopupView;
	
	//Model定義情報設定
	var CreateSObjectModel = modelDefine.CreateSObjectModel;
	var InputFormItemModel = modelDefine.InputFormItemModel;
	var ButtonFormItemModel = modelDefine.ButtonFormItemModel;
	var LabelFormItemModel = modelDefine.LabelFormItemModel;	
	var InputFormItemCollection = modelDefine.InputFormItemCollection;
	var LabelFormItemCollection = modelDefine.LabelFormItemCollection;
	var ButtonFormItemCollection = modelDefine.ButtonFormItemCollection;
	
	//メインのフォームページ全体のView
    var MainFormPageView = Backbone.View.extend({
	    el:$("#mainform"),
		events:{
			"click #mainForm_settings_btn":"showPanel",
			"click #mainform_header_tofinish_btn":"clickToFinish",
			"click #mainform_header_toinput_btn":"clickToInput",
			"click #mainForm_top_link":"clickToTopPage",
			"click #mainForm_openmode_link":"clickOpenModeEnable",
			"click #mainForm_changetitle_link":"clickChangeTitle",
			"click #mainForm_inputsetting_link":"clickToInputsettingPage",
			"click #mainForm_finishsetting_link":"clickToFinishsettingPage",
			//"click #mainForm_localdata_link":"changePageLocalData",
			"click #mainForm_delete_link":"clickDeleteConfirm",
			"taphold #mainForm_input,#mainForm_finish":"tapOpenModeDisable",
			"touchstart #mainForm_input,#mainForm_finish":"touchOpenModeDisable"
		},
		initialize:function () {
			_.bindAll(this);
			logToConsole("mainform ページビュー初期化");
			//サブビューを作成
			this.inputForm = new InputFormView();
			this.finishForm = new FinishFormView();
			//画面サイズを指定（余白をクリア 無理矢理）
			this.contentEle = this.$el.find("#mainForm_content");
			this.contentEle.css("padding"  , "0px");
			this.contentEle.css("margin" , "0px");
			this.updateWindowSize();
			
			//設定パネル
			this.settingPanelEle = this.$el.find("#mainForm_settings_panel");
			//ヘッダ関連の要素
			this.headerEle = this.$el.find("#mainForm_header");
			this.headerTitleEle = this.$el.find("#mainForm_header_title");
			this.headerToFinishBtnEle = this.$el.find("#mainform_header_tofinish_btn");
			this.headerToInutBtnEle = this.$el.find("#mainform_header_toinput_btn");
			
			//各種ポップアップ
			this.passwordPopupView = new PasswordConfofirmPopupView();
			this.titlePopupView = new FormTitlePopupView();
			this.deletePopupView = new DeleteConfirmPopupView();
			this.openModePopupView = new OpenModePopup();
			
			this.formdetail = {};
			this.formitemlist = {};
			this.viewWindowName = "";
			this.openmode = false;
			
			//イベント設定
			this.listenTo(this.inputForm , "toFinish" , this.eventToFinish);
			this.listenTo(this.finishForm , "toInput" , this.eventToInput);
			
			//始めは完了画面は非表示にしておく
			this.finishForm.hide();
			this.headerToInutBtnEle.hide();
		},
		
		updateWindowSize:function(){
			this.contentEle.css("width"  , getWindowWidth() + "px");
			this.contentEle.css("height" , getWindowHeight() + "px");
		},
		
		init:function(args){
			
			var _this = this;
			var refreshFunc = function(){
				_this.headerTitleEle.text(FormData.getFormTitle());
				_this.setFormData();
				_this.refreshFormContent();
				_this.disableOpenMode();
				var formType = args.formtype;
				if(formType == "finish"){
					_this.inputForm.hide();
					_this.finishForm.show();
					_this.setFinishWindow();
				}else{
					_this.finishForm.hide();
					_this.inputForm.show();
					_this.setInputWindow();
				}
			}
			
			showLoading();
			
			this.formdetail = {};
			this.formitemlist = {};
			if(args.form != null){
				
				var success = function(){
					logToConsole("FormData init 完了");
					refreshFunc();
					hideLoading();
				}
				var error = function(){
					logToConsole("フォームデータ初期化エラー");
					hideLoading();
				}
				
				//読み込み開始
				showLoading();
				FormData.init( args.form.innerData , success , error );
			}else{
				refreshFunc();
				hideLoading();
			}
		},
		
		render:function () {
		    return this;
		},
	
		showPanel:function(){
			logToConsole("panel open");
			this.settingPanelEle.panel("open");
		},

		setFormData:function(){
			this.formdetail = FormData.getFormDetail();
			this.formitemlist = FormData.getFormItemList();
			this.createDataType( this.formitemlist.input );
			
			this.inputForm.formdata = FormData;
			this.finishForm.formdata = FormData;
			this.inputForm.detail   = this.formdetail.input;
			this.finishForm.detail  = this.formdetail.finish;
		},
		
		clickToFinish:function(){
			this.eventToFinish();
		},
		
		clickToInput:function(){
			this.eventToInput();
		},
		
		clickToTopPage:function(){
			changePage({"toPage":"top"});
		},
		
		clickOpenModeEnable:function(){
			var _this = this;
			this.openModePopupView.open({
				ok:function(){
					_this.enableOpenMode();
					_this.settingPanelEle.panel("close");
					_this.openModePopupView.close();
				}
			});
		},
		
		clickChangeTitle:function(){
			var _this = this;
			this.titlePopupView.open(
				FormData.getFormTitle() ,
				{
					save:function( name ){
						_this.updateFormTitle( name );
						_this.titlePopupView.close();
					},
					cancel:function(){
						_this.titlePopupView.close();
					}
				}
			);
		},
		
		clickToInputsettingPage:function(){
			logToConsole("入力画面設定へ");
			changePage({"toPage":"inputSetting",
				"returnWindow":this.viewWindowName});
		},
		
		clickToFinishsettingPage:function(){
			logToConsole("完了画面設定へ");
			changePage({"toPage":"finishSetting",
				"returnWindow":this.viewWindowName});
		},
		
		clickDeleteConfirm:function(){
			logToConsole("削除確認");
			var _this = this;
			this.deletePopupView.open(
				{ok:
					function(){
						_this.deletePopupView.close();
						_this.deleteForm();
					},
				cancel:
					function(){
						_this.deletePopupView.close();
					}
				}
			);
			
		},
		
		tapOpenModeDisable:function( e ){
			//logToConsole("ロングタップした？");
			var id = $(e.target).attr("id");
			if(this.openmode && 
				(id == "mainForm_input" ||
				id == "mainForm_finish")){
				if(AppData.isEnablePassword()){
					var _this = this;
					this.passwordPopupView.open(
						{
							ok:function(){
								_this.passwordPopupView.close();
								_this.disableOpenMode();
							},
							cancel:function(){
								_this.passwordPopupView.close();
							}
						}
					);
				}else{
					this.disableOpenMode();
				}
			}
		},
		
		touchOpenModeDisable:function(e){
			var id = $(e.target).attr("id");
			logToConsole("target : " + id );
			if(this.openmode && 
			   (id == "mainForm_input" ||
				id == "mainForm_finish")){
				e.preventDefault();
			}
		},
		
		createDataType:function( itemList ){
			//対象のModelの型を構築
			//FormData
			var fieldNames = [];
			_.each( itemList , function(item){
				if(item.FieldType == "input"){
					fieldNames.push(item.FieldName);
				}
			});
			
			if(fieldNames.length > 0){
				logToConsole("モデル作成 : " + fieldNames);
				CreateModel = CreateSObjectModel.extend({
					sobjectType: FormData.getSObjectName(),
					fieldlist: fieldNames
				});
			}else{
				CreateModel = null;
			}
			
		},
		
		refreshFormContent:function(){
			this.refreshInputFormContent()
			this.refreshFinishFormContent();
		},
		
		refreshInputFormContent:function(){
			
			logToConsole("入力画面再更新");
			
			this.inputForm.reset();
			
			var _this = this;
			_.each( this.formitemlist.input , function(f){
				
				if(f.FieldType == "label"){
					_this.inputForm.addLabelModel(
							new LabelFormItemModel({
								labelsetting:f
							})
					);
				}else if(f.FieldType == "button"){
					_this.inputForm.button = new ButtonFormItemModel({
						buttonsetting:f
					});
				}else{
					var fieldInfo = FormData.findSObjectField(f.FieldName);
					if(fieldInfo == null){
						logToConsole("項目情報の不整合が発生している : " + f.FieldName);
						return;
					}
					
					_this.inputForm.addInputModel( 
							new InputFormItemModel({
								inputsetting:f,
								fieldinfo:fieldInfo
							})
					);
					
				}
			});
			this.inputForm.render();
			
		},
		
		enableOpenMode:function(){
			this.openmode = true;
			this.headerEle.hide();
		},
		disableOpenMode:function(){
			this.openmode = false;
			this.headerEle.show();
		},
		
		deleteForm:function(){
			
			var _this = this;
			var successFunc = function(){
				logToConsole("フォームデータ削除完了");
				hideLoading();
				_this.clickToTopPage();
			}
			
			var errorFunc = function(){
				logToConsole("フォームデータ削除に失敗");
				hideLoading();
			}
			
			//formlist , formdata slot , imagefile
			//を削除する
			showLoading();
			FormListData.deleteForm( FormData.getSlotId() ,
				function(){
					logToConsole("リスト更新後");
					FormData.deleteFormData( successFunc , errorFunc);
				} , 
				errorFunc 
			);
			
		},
		
		updateFormTitle:function( title ){
			var _this = this;
			FormListData.updateFormTitle( FormData.getSlotId() , title );
			FormListData.saveFormList( 
				function(){
					_this.headerTitleEle.text( title );
					FormData.setFormTitle( title );
				} , 
				function(){
					logToConsole("フォームリストデータ保存に失敗");
				} 
			);
		},
		
		refreshFinishFormContent:function(){
			
			logToConsole("完了画面再更新");
			
			this.finishForm.reset();
			var _this = this;
			_.each( this.formitemlist.finish , function(f){
				_this.finishForm.addLabelModel(
					new LabelFormItemModel({
						labelsetting:f
					})
				);
			});
			this.finishForm.render();
		},
		
		setFinishWindow:function(){
			this.headerToFinishBtnEle.hide().removeClass("ui-btn-right");
			this.headerToInutBtnEle.show().addClass("ui-btn-right");
			this.viewWindowName = "finish";
		},
		setInputWindow:function(){
			this.headerToInutBtnEle.hide().removeClass("ui-btn-right");
			this.headerToFinishBtnEle.show().addClass("ui-btn-right");
			this.viewWindowName = "input";
		},
		
		eventToFinish:function(){
			logToConsole("完了画面へ");
			var _this = this;
			this.inputForm.animationHide(
				function(){
					_this.setFinishWindow();
					_this.finishForm.animationShow();
				}
			);
		},
		eventToInput:function(){
			logToConsole("入力画面へ");
			var _this = this;
			this.finishForm.animationHide(
				function(){
					_this.setInputWindow();
					_this.inputForm.animationShow();
				}
			);
		},
		
		dispose:function(){
			this.inputForm.dispose();
			this.finishForm.dispose();
			this.formdetail = {};
			this.formitemlist = {};
		}
	});
	
	var InputFormView = BaseInputContentView.extend({
		el:$("#mainForm_input"),
		
		initialize:function(){
			BaseInputContentView.prototype.initialize.call(this);
			_.bindAll(this);
			
			this.inputErrorPopup = new InputErrorPopupView();
			this.submitErrorPopup = new SubmitErrorPopupView();
			
			this.$el.css("width"  , getWindowWidth() + "px");
			this.$el.css("height" , getWindowHeight() + "px");
		},
		
		renderFormItem:function () {
			logToConsole("main input renderitem");
			
			BaseInputContentView.prototype.renderFormItem.call(this);
			
			if(this.inputViews.length > 0){
				this.buttonView.addClick( this.onSubmit );
			}else{
				this.buttonView.disableClick();
				logToConsole("disable after");
			}
			
			logToConsole("main input renderitem end");
		},
		
		onSubmit:function(){
			
			logToConsole("submit click!!!");
			
			//validate
			var validateResult = [];
			var values = {};
			var _this = this;
			_.each( this.inputViews , function( v ){
				var res = v.validate();
				if( res != null ){
					var tmp = {};
					tmp["Name"] = v.getLabelName();
					tmp["Value"] = res;
					validateResult.push( tmp );
				}
				values[v.getFieldName()] = v.getValue();
			});
			
			if( validateResult.length > 0 ){
				logToConsole("invalid : " +  validateResult);
				this.openInputErrorPopup( validateResult );
				return;
			}
			
			showLoading();
			
			//SFへデータを送信（POST）
			logToConsole("submit data : " + JSON.stringify(values));
			var tmpData = new CreateModel(values);
			
			var successFunc = function(){
				logToConsole("作成成功");
				_this.clearInput();
				hideLoading();
				_this.trigger("toFinish");
			}
			
			var errorFunc = function(error){
				
				logToConsole("作成失敗 :" + JSON.stringify(error));	
				
				hideLoading();
				
				var status = error.status;
				if( status == 400){
					
					//あらゆるエラーの形式に備えてtry catchしておく
					try{
						var responses = JSON.parse( error.responseText );
						var invalid = [];
						
						_.each( responses , function( res ){
							
							var message = res.message.split(":")[0];
							_.each( res.fields , function( f ){
								var item = _this.findInputFormItemView( f );
								if( item != null ){
									var tmp = {};
									tmp["Name"]  = item.getLabelName();
									tmp["Value"] = message;
									invalid.push( tmp );
								}else{
									var fieldInfo = FormData.findSObjectField(f);
									if(fieldInfo != null){
										var tmp = {};
										tmp["Name"]  = fieldInfo.Label;
										tmp["Value"] = message;
										invalid.push( tmp );
									}
								}
							});
							
						});
						
						if( invalid.length > 0 ){
							logToConsole("invalid : " +  invalid);
							_this.openInputErrorPopup( invalid );
							return;
						}
						
					}catch( e ){
						logToConsole( e );
					}
				}
				
				//想定外のエラーの場合は取得したメッセージをそのままだす
				//ローカルにデータを記録も検討
				logToConsole( "予想外のエラー" );
				_this.submitErrorPopup.setMessage( JSON.stringify(error) );
				_this.submitErrorPopup.open( 
					{ok:function(){ _this.submitErrorPopup.close() }}
				);
				
			}
			
			forcetkClient.create( tmpData.sobjectType ,tmpData.toJsonFromValues() , successFunc , errorFunc);
		},
		
		openInputErrorPopup:function( m ){
			
			var _this = this;
			var callback = function(){
				_this.inputErrorPopup.close();
			}
			
			this.inputErrorPopup.setMessage( m );
			this.inputErrorPopup.open( { ok:callback });
			
		},
		
		findInputFormItemView:function( fieldName ){
			
			//そんなに数も多くないので線形探索
			for(var i=0;i< this.inputViews.length ;i++ ){
				if( fieldName == this.inputViews[i].getFieldName() ){
					return this.inputViews[i];
				}
			}
			return null;
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
		
		clearInput:function(){
			_.each( this.inputViews , function( v ){
				v.clear();
			});
		},
		
		animationShow:function( callback ){
			this.$el.fadeIn(300 , callback);
		},
		animationHide:function( callback ){
			this.$el.fadeOut(300 , callback);
		},
		show:function(){
			this.$el.show();
		},
		hide:function(){
			this.$el.hide();
		}
		
	});
	
	var FinishFormView = BaseFinishContentView.extend({
		el:$("#mainForm_finish"),
		initialize:function(){
			BaseFinishContentView.prototype.initialize.call(this);
			_.bindAll(this);
			this.$el.css("width"  , getWindowWidth() + "px");
			this.$el.css("height" , getWindowHeight() + "px");
		},
		
		animationShow:function( callback ){
			this.$el.fadeIn(300 , callback);
		},
		animationHide:function( callback ){
			this.$el.fadeOut(300 , callback);
		},
		show:function(){
			this.$el.show();
		},
		hide:function(){
			this.$el.hide();
		}
	});

	var PasswordConfofirmPopupView = SimplePopupView.extend({
		el:$("#mainForm_showheader_popup"),
    	events:{
    		"click #mainForm_showheader_password_ok_btn":"clickOk",
    		"click #mainForm_showheader_password_cancel_btn":"clickCancel"
    	},
    	initialize:function(){
    		SimplePopupView.prototype.initialize.call(this);
    		this.inputEle = this.$el.find("#mainForm_showheader_password_input");
    		this.inputErrorEle = this.$el.find("#mainForm_showheader_password_inputerror");
    	},
    	clickOk:function(){
    		var tmpVal = this.inputEle.val();
    		if(AppData.getAppPassword() != tmpVal){
    			this.inputErrorEle.show();
    			return false;
    		}
    		SimplePopupView.prototype.clickOk.call(this);
    	},
    	open:function(callback){
    		this.inputErrorEle.hide();
    		this.inputEle.val("");
    		SimplePopupView.prototype.open.call(this , callback);
    	}
	});
	
	var InputErrorPopupView = SimplePopupView.extend({
		el:$("#mainForm_input_inputerror_popup"),
    	events:{
    		"click #mainForm_input_inputerror_popup_button":"clickOk",
    	},
    	setMessage:function( messages ){
    		var ele = this.$el.find("#mainForm_input_inputerror_popup_message");
    		ele.children().remove();
    		
    		var tempEle = this.$el.find( "#mainForm_input_inputerror_popup_message_temp" );		
    		_.each( messages , function( m ){
    			logToConsole(m.Name + " : " + m.Value);
    			var temp = _.template( tempEle.html() );
    			logToConsole(m.Name + " : " + m.Value);
    			ele.append( temp( m ) );
			});
    	}
	});

	var SubmitErrorPopupView = SimplePopupView.extend({
		el:$("#mainForm_input_submiterror_popup"),
    	events:{
    		"click #mainForm_input_submiterror_popup_button":"clickOk",
    	},
    	setMessage:function( message ){
    		this.$el.find("#mainForm_input_submiterror_popup_message").text(message);
    	}
	});
	
	var FormTitlePopupView = Backbone.View.extend({
		el:$("#mainForm_changetitle_popup"),
    	events:{
    		"click #mainForm_changetitle_buttons_save_btn":"clickSave",
    		"click #mainForm_changetitle_buttons_cancel_btn":"clickCancel"
    	},
    	initialize:function(){
    		this.inputEle = this.$el.find("#mainForm_changetitle_nameinput");
    		this.inputErrorEle = this.$el.find("#mainForm_changetitle_nameinputerror");
    		this.callback = {};
    	},
    	clickSave:function(){
    		var tmpVal = this.inputEle.val();
    		if(isEmpty(tmpVal)){
    			this.inputErrorEle.show();
    			return false;
    		}
    		this.callback.save(tmpVal);
    	},
    	clickCancel:function(){
    		this.callback.cancel();
    	},
    	open:function(name , callback){
    		this.inputErrorEle.hide();
    		this.inputEle.val(name);
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
	
	var DeleteConfirmPopupView = SimplePopupView.extend({
		el:$("#mainForm_delete_popup"),
    	events:{
    		"click #mainForm_delete_buttons_delete_btn":"clickOk",
    		"click #mainForm_delete_buttons_cancel_btn":"clickCancel"
    	}
	});
	
	var OpenModePopup = SimplePopupView.extend({
		el:$("#mainForm_openmode_popup"),
    	events:{
    		"click #mainForm_openmode_buttons_ok_btn":"clickOk"
    	}
	});
	
	this.MainFormPageView = MainFormPageView;
	
	logToConsole("MainFormPage:init完了");
	
}
