
//アプリ初期化処理
function setupApp( userId ){
	
    console.log("setupApp : " + userId);
    	
    //Utilityなやつを初期化
    initStorageManager.call(this);
    initFileManager.call(this);
    initSFFieldDefine.call(this);
    initSFSObjectConverter.call(this);
    
    //共通model初期化
    initModel.call(app.models);
    //共通view初期化
    initView.call(app.views , app.models);
    
    //data 初期化
    initAppData.call(app.datas);
 
    //page初期化
	initTopPage.call(app.pages , app.models , app.datas, app.views);
	initAddFormPage.call(app.pages , app.models, app.datas, app.views);
	initMainFormPage.call(app.pages , app.models , app.datas , app.views);
	initInputSettingPage.call(app.pages , app.models , app.datas , app.views);
	initFinishSettingPage.call(app.pages , app.models , app.datas , app.views);
	
	app.TopPageView = new app.pages.TopPageView();
	app.AddFormPageView = new app.pages.AddFormPageView();
	app.MainFormPageView = new app.pages.MainFormPageView();
	app.InputSettingPageView = new app.pages.InputSettingPageView();
	app.FinishSettingPageView = new app.pages.FinishSettingPageView();
	
	var successFunc = function(){
		changePage({"toPage":"top"})
		console.log("page initialize!!");
	}
	var errorFunc = function(){
		console.log("設定読み込みエラー");
	}
	app.datas.AppData.init( successFunc , errorFunc );
    
}

function condirmLoginChange(){
	
}

function changePage(args){

	function disposePage(){
		if(app.currentPage != null){
			app.currentPage.dispose();
			app.currentPage = null;
		}
	}

	var toPage = args.toPage;
	var nextPage = null;
	if(toPage == "top"){
		nextPage = app.TopPageView;
	}else if(toPage == "addForm"){
		nextPage = app.AddFormPageView;
	}else if(toPage == "mainForm"){
		nextPage = app.MainFormPageView;
	}else if(toPage == "inputSetting"){
		nextPage = app.InputSettingPageView;
	}else if(toPage == "finishSetting"){
		nextPage = app.FinishSettingPageView;
	}else{
		console.log("undefined page : " + toPage);
	}
	console.log("change page");
	if(nextPage != null){
		disposePage();
		app.currentPage = nextPage;
		$.mobile.changePage("#" + app.currentPage.$el.attr("id"));
		app.currentPage.init(args);
	}
	
}