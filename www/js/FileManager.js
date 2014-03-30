function initFileManager(  ) {

	var DATA_SIZE = 10 * 1024 * 1024; //10M
	var FILE_ENABLE = false;
	var FileSystem = null;
	
	var FILE_NAME_INPUT_BG  = "input_bg_";
	var FILE_NAME_FINISH_BG = "finish_bg_";

	logToConsole("FileManager:init開始");
	var requestFileSystem = window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	if( requestFileSystem == null ){
		FILE_ENABLE = false;
		logToConsole("FileManager:init完了 file undefined");
	}else{
		
		requestFileSystem(LocalFileSystem.TEMPORARY, DATA_SIZE, 
		function(　fileSystem　){
			FileSystem = fileSystem;
			FILE_ENABLE = true;
			logToConsole("FileManager:init完了");
		}, function( e ){
    		FILE_ENABLE = false;
        	logToConsole("FileManager:init完了 error : " + e.code);
    	});
	}
	
	var FileManager = {
			
		loadInputBackgroundImage:function( slotId , success , fail){
			
			if(!FILE_ENABLE){
				fail();
			}
			
			logToConsole("loadFile : " + slotId);
			FileSystem.root.getFile(FILE_NAME_INPUT_BG + slotId , 
				{ create: false, exclusive: false}, 
				function(fileEntry){
					
					logToConsole( "success getFile entry url : " + fileEntry.toURL());
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							logToConsole("入力画面背景 ファイル読み込み成功 : ");
							success( this.result );
						};
						reader.readAsText(file);
					}, fail);
				}, 
				function(error){
					logToConsole("error getFile : " + error);
					fail(error);
				}
			);
		},
		
		saveInputBackgroundImage:function(slotId , imageData , success , fail){
			
			if(!FILE_ENABLE){
				fail();
			}
			
			logToConsole("save image!!");
			FileSystem.root.getFile(FILE_NAME_INPUT_BG + slotId , 
				{ create: true, exclusive: false}, 
				function(fileEntry){
					
					logToConsole( "entry url : " + fileEntry.toURL());
					// ファイル書き込み
					fileEntry.createWriter(function(fileWriter){
						// ファイル書き込み成功イベント
						fileWriter.onwriteend = function(e){
							logToConsole("入力画面背景 ファイル書き込み成功 : " + e);
							success(e);
						};
						// ファイル書き込み失敗イベント
						fileWriter.onerror = function(e){
							logToConsole("入力画面背景 ファイル書き込み失敗 : " + e);
							fail(e);
						};
						fileWriter.write(imageData);
					});
				}, 
				function(error){
					logToConsole("error getFile : " + error);
					fail(e);
				}
			);
		},
		
		removeInputBackgroundImage:function(slotId , success , fail){
			if(!FILE_ENABLE){
				fail();
			}
			
			logToConsole("removeFile : " + slotId);
			FileSystem.root.getFile(FILE_NAME_INPUT_BG + slotId , 
				{ create: false, exclusive: false}, 
				function(fileEntry){
					logToConsole( "success getFile entry url : " + fileEntry.toURL());
					fileEntry.remove(success , fail);
				}, 
				function(error){
					logToConsole("error getFile : " + JSON.stringify(error));
					if(error.code == FileError.NOT_FOUND_ERR){
						success();
					}else{
						fail(error);
					}
				}
			);
		},
		
		loadFinishBackgroundImage:function( slotId , success , fail){
			
			if(!FILE_ENABLE){
				fail();
			}
			
			logToConsole("loadFile : " + slotId);
			FileSystem.root.getFile(FILE_NAME_FINISH_BG + slotId , 
				{ create: false, exclusive: false}, 
				function(fileEntry){
					
					logToConsole( "success getFile entry url : " + fileEntry.toURL());
					
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							logToConsole("完了画面背景 ファイル読み込み成功 : ");
							success( this.result );
						};
						reader.readAsText(file);
					}, fail);
				}, 
				function(error){
					logToConsole("error getFile : " + error);
					fail(error);
				}
			);
		},
		
		saveFinishBackgroundImage:function(slotId , imageData , success , fail){
			
			if(!FILE_ENABLE){
				fail();
			}
			
			logToConsole("save image!!");
			FileSystem.root.getFile(FILE_NAME_FINISH_BG + slotId , 
				{ create: true, exclusive: false}, 
				function(fileEntry){
					
					logToConsole( "entry url : " + fileEntry.toURL());
					// ファイル書き込み
					fileEntry.createWriter(function(fileWriter){
						// ファイル書き込み成功イベント
						fileWriter.onwriteend = function(e){
							logToConsole("完了画面背景 ファイル書き込み成功 : " + e);
							success(e);
						};
						// ファイル書き込み失敗イベント
						fileWriter.onerror = function(e){
							logToConsole("完了画面背景 ファイル書き込み失敗 : " + e);
							fail(e);
						};
						fileWriter.write(imageData);
					});
					
				}, 
				function(error){
					logToConsole("error getFile : " + error);
					fail(e);
				}
			);
		},
		
		removeFinishBackgroundImage:function(slotId , success , fail){
			if(!FILE_ENABLE){
				fail();
			}
			
			logToConsole("removeFile : " + slotId);
			FileSystem.root.getFile(FILE_NAME_FINISH_BG + slotId , 
				{ create: false, exclusive: false}, 
				function(fileEntry){
					logToConsole( "success getFile entry url : " + fileEntry.toURL());
					fileEntry.remove(success , fail);
				}, 
				function(error){
					logToConsole("error getFile : " + JSON.stringify(error));
					if(error.code == FileError.NOT_FOUND_ERR){
						success();
					}else{
						fail(error);
					}
				}
			);
		}
		
	}
	
	this.FileManager = FileManager;

}
