function initView( modelDefine ){

	logToConsole("View:init開始");

	//ページをまたいで使用される共通的なViewを定義

	var BaseFormItemView = this.BaseFormItemView = Backbone.View.extend({
		formitem:{},
		initialize:function(){
		},
		render:function(){
			return this;
		},
		setPosition:function(){
			this.$el.css("width"  , this.formitem.Width + "px");
			this.$el.css("height" , this.formitem.Height + "px");
			this.$el.css("top"    , this.formitem.PosY + "px");
			if(this.formitem.HorizontalCenter){
				this.formitem.PosX = (getWindowWidth() / 2) - (this.formitem.Width / 2);
			}
			this.$el.css("left" , this.formitem.PosX + "px");
			this.$el.css("position" , "absolute");
		}
	});
	
	var TextLabelFormItemView = this.TextLabelFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#label_formitem_text").html()),
		render:function(){
			logToConsole("label text render");
			logToConsole(JSON.stringify(this.formitem));
			if( this.formitem.TextColor == null){
				this.formitem.TextColor = "000";
			}
			this.$el.html(this.tmpl(this.formitem));
			if( this.formitem.TextSize == null){
				this.formitem.TextSize = 1;
			}
			var fontSize = "large";
			if(this.formitem.TextSize == 2){
				fontSize = "x-large";
			}else if(this.formitem.TextSize == 3){
				fontSize = "xx-large";
			}
			
			this.$el.css("font-size"  , fontSize);
			this.setPosition();
			logToConsole("pospos : " + this.$el.css("position"));
			logToConsole("label text render end");
			return this;
		}
	});

	var SubmitButtonFormItemView = this.SubmitButtonFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#button_formitem_submit").html()),
		render:function(){
			logToConsole("button submit render");
			this.$el.html(this.tmpl(this.formitem));
			this.$el.find("a").button();
			this.setPosition();
			logToConsole("button submit end");
			return this;
		},
		addClick:function( clickFunc ){
			this.$el.find("a").click( clickFunc );
		},
		disableClick:function(){
			this.$el.find("a").prop('disabled', true).addClass('ui-disabled');
		}
	});
	
	var BaseInputFormItemView = this.BaseInputFormItemView = BaseFormItemView.extend({
		fieldinfo:{},
		refresh:function(){
		},
		validate:function(){
			return null;
		},
		getValue:function(){
			return null;
		},
		getFieldName:function(){
			return this.formitem.FieldName;
		},
		getLabelName:function(){
			return isEmpty(this.formitem.Label) ? this.fieldinfo.Label : this.formitem.Label;
		},
		clear:function(){
		}
	});
	
	var MailAddressInputFormItemView = this.MailAddressInputFormItemView = BaseInputFormItemView.extend({
		tmpl:_.template($("#input_formitem_mailaddress").html()),
		initialize:function(){
		},
		render:function(){
			logToConsole("input email render");
			this.$el.html(this.tmpl(this.formitem));
			this.$el.find("input").textinput();
			this.setPosition();
			logToConsole("input email render end");
			return this;
		},
		refresh:function(){
			
		},
		validate:function(){
			var name = isEmpty(this.formitem.Label) ? this.fieldinfo.Label : this.formitem.Label;
			var res = null;
			var value = this.getValue();
			if(isEmpty(value)){
				if(this.formitem.Require){
					res = "入力必須です";
				}
			}else{
				if( !validateEmailAddress( value )){
					res = "入力形式が不正です"
				}
			}
			return res;
		},
		getValue:function(){
			return this.$el.find("input").val();
		},
		clear:function(){
			this.$el.find("input").val("");
		}
	});
	
	var StringInputFormItemView = this.StringInputFormItemView = BaseInputFormItemView.extend({
		tmpl:_.template($("#input_formitem_string").html()),
		initialize:function(){
		},
		render:function(){
			logToConsole("input string render");
			this.$el.html(this.tmpl(this.formitem));
			this.$el.find("input").textinput();
			this.setPosition();
			logToConsole("input string render end");
			return this;
		},
		refresh:function(){
			
		},
		validate:function(){
			if(!this.formitem.Require){
				return null;
			}
			var value = this.getValue();
			if(!isEmpty(value)){
				return null;
			}
			var name = isEmpty(this.formitem.Label) ? this.fieldinfo.Label : this.formitem.Label;
			return "入力必須です";
		},
		getValue:function(){
			return this.$el.find("input").val();
		},
		clear:function(){
			this.$el.find("input").val("");
		}
	});
/*
	var TextAreaInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_textarea_input").html()),
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
	
	var IntegerInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_integer_input").html()),
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

	var DoubleInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_double_input").html()),
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
	
	var PhoneInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_phone_input").html()),
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
	
	var UrlInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_url_input").html()),
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

	var DateInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_date_input").html()),
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

	var DateTimeInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_datetime_input").html()),
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
	
	var PicklistInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_picklist_input").html()),
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
	
	var PicklistRadioInputFormItemView = BaseFormItemView.extend({
		tmpl:_.template($("#mainForm_picklistradio_input").html()),
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
	*/
	

    var SimplePopupView =  this.SimplePopupView = Backbone.View.extend({
    	
    	initialize:function(){
    		this.callbackFunc = {};
    	},
    	open:function(callback){
    		this.callbackFunc = callback;
    		this.$el.popup("open");
    	},
    	close:function(){
    		try{
    			this.$el.popup("close");
    		}catch(e){
    			//なぜか例外が発生するのでキャッチしておく
    			//logToConsole( "close error : " + JSON.stringify(e));
    		}
    	},
    	clickOk:function(){
    		if(this.callbackFunc.ok != null){
    			this.callbackFunc.ok();
    		}
    	},
    	clickCancel:function(){
    		if(this.callbackFunc.cancel != null){
    			this.callbackFunc.cancel();
    		}
    	},
    	clickOther:function(){
    		if(this.callbackFunc.other != null){
    			this.callbackFunc.other();
    		}
    	}
    	
    });
    
	var BaseInputContentView = this.BaseInputContentView = Backbone.View.extend({
		
		initialize:function () {
			this.formdata = {};
			this.detail   = {};
			this.button = null;
			this.inputCollection = new InputFormItemCollection();
			this.labelCollection = new LabelFormItemCollection();
			this.buttonView = null;
			this.inputViews = [];
			this.labelViews = [];
			
		},
		
		init:function(){
		},
		
		reset:function(){
			this.removeCollection();
			this.removeView();
			this.resetBg();
		},
		
		render:function () {
			logToConsole("content render");

			this.renderFormItem();
			
			this.renderBackgroundColor();
			this.renderBackgroundImage();
			
			logToConsole("content render end");
			return this;
		},
		
		renderFormItem:function(){
			
			logToConsole("formitem render");
			
			var _this = this;
			this.removeView();
			this.inputCollection.each(function ( m ) {
				var tmpView = _this.createInputFormItemView( m );
				tmpView.model = m;
				tmpView.formitem = m.get("inputsetting");
				tmpView.fieldinfo = m.get("fieldinfo");
				_this.inputViews.push(tmpView);
				tmpView.render();
				_this.$el.append(tmpView.$el);
			});
			this.labelCollection.each(function ( m ) {
				var tmpView = _this.createTextLabelFormItemView();
				tmpView.model = m;
				tmpView.formitem = m.get("labelsetting");
				_this.labelViews.push(tmpView);
				tmpView.render();
				_this.$el.append(tmpView.$el);
			});
			
			this.buttonView = _this.createSubmitButtonFormItemView();
			this.buttonView.model = this.button;
			this.buttonView.formitem = this.button.get("buttonsetting");
			this.buttonView.render();
			this.$el.append(this.buttonView.$el);
			
			logToConsole("formitem render end");
			
		},
		
		createInputFormItemView:function( m ){
			return null;
		},
		createTextLabelFormItemView:function(){
			return new TextLabelFormItemView();
		},
		createSubmitButtonFormItemView:function(){
			return new SubmitButtonFormItemView();
		},
		
		renderBackgroundColor:function(){
			this.$el.css("background-color" , "#" + this.detail.backgroundcolor);
		},
		
		renderBackgroundImage:function(){
			var tmpData = this.formdata.getInputBgImageData();
			if(this.detail.useImage && tmpData != null){
				this.$el.css("background-image" , "url(data:image/jpeg;base64,"+ tmpData + ")");
			}else{
				this.resetBgImage();
			}
		},
		
		resetBgImage:function(){
			this.$el.css("background-image", "none");
		},
		resetBgColor:function(){
			this.$el.css("background-color", "#fff");
		},
		
		resetBg:function(){
			this.resetBgImage();
			this.resetBgColor();
		},
		
		removeCollection:function(){
		    var col = this.inputCollection;
            _.each(this.inputCollection.models , function(m) {
                col.remove(m);
			});
            this.inputCollection = new InputFormItemCollection();
            col = this.labelCollection;
            _.each(this.labelCollection.models , function(m) {
                col.remove(m);
			});
            this.labelCollection = new LabelFormItemCollection();

            this.button = null;
		},
		removeView:function(){
            _(this.inputViews).each(function(view) {
				view.remove();
			});
			this.inputViews = [];
			_(this.labelViews).each(function(view) {
				view.remove();
			});
			this.labelViews = [];
			if(this.buttonView != null){
				this.buttonView.remove();
			}
			this.buttonView = null;
			
			this.$el.children().remove();
		},
		addInputModel:function(m){
			this.inputCollection.add(m);
		},
		addLabelModel:function(m){
			this.labelCollection.add(m);
		},
		dispose:function(){
			this.reset();
		}
	});
	
	var BaseFinishContentView = this.BaseFinishContentView = Backbone.View.extend({
		
		initialize:function () {
			this.formdata = {};
			this.detail   = {};
			this.labelCollection = new LabelFormItemCollection();
			this.labelViews = [];
		},
		
		init:function(){
		},
		
		reset:function(){
			this.removeCollection();
			this.removeView();
			this.resetBg();
		},
		
		render:function () {
			logToConsole("finish content render");

			this.renderFormItem();
			
			this.renderBackgroundColor();
			this.renderBackgroundImage();
			
			logToConsole("finish content render end");
			return this;
		},
		
		renderFormItem:function(){
			
			logToConsole("finish formitem render");
			
			var _this = this;
			this.removeView();
			this.labelCollection.each(function ( m ) {
				var tmpView = _this.createTextLabelFormItemView();
				tmpView.model = m;
				tmpView.formitem = m.get("labelsetting");
				_this.labelViews.push(tmpView);
				tmpView.render();
				_this.$el.append(tmpView.$el);
			});
			
			logToConsole("finish formitem render end");
			
		},
		
		createTextLabelFormItemView:function(){
			return new TextLabelFormItemView();
		},
		
		renderBackgroundColor:function(){
			this.$el.css("background-color" , "#" + this.detail.backgroundcolor);
		},
		
		renderBackgroundImage:function(){
			var tmpData = this.formdata.getFinishBgImageData();
			if(this.detail.useImage && tmpData != null){
				this.$el.css("background-image" , "url(data:image/jpeg;base64,"+ tmpData + ")");
			}else{
				this.resetBgImage();
			}
		},
		
		resetBgImage:function(){
			this.$el.css("background-image", "none");
		},
		resetBgColor:function(){
			this.$el.css("background-color", "#fff");
		},
		
		resetBg:function(){
			this.resetBgImage();
			this.resetBgColor();
		},
		
		removeCollection:function(){
		    col = this.labelCollection;
            _.each(this.labelCollection.models , function(m) {
                col.remove(m);
			});
            this.labelCollection = new LabelFormItemCollection();
		},
		removeView:function(){
            _(this.labelViews).each(function(view) {
				view.remove();
			});
			this.labelViews = [];
			this.$el.children().remove();
		},
		addLabelModel:function(m){
			this.labelCollection.add(m);
		},
		dispose:function(){
			this.reset();
		}
	});
	
	var InputFormItemModel = modelDefine.InputFormItemModel;
	var ButtonFormItemModel = modelDefine.ButtonFormItemModel;
	var LabelFormItemModel = modelDefine.LabelFormItemModel;	
	var InputFormItemCollection = modelDefine.InputFormItemCollection;
	var LabelFormItemCollection = modelDefine.LabelFormItemCollection;
	var ButtonFormItemCollection = modelDefine.ButtonFormItemCollection;
	
	logToConsole("View:init完了");

}
