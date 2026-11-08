/* Validated game/decor backup, with synchronous local-storage rollback on failure. */
(function(root){
  'use strict';
  const C=root.CottageCore,D=root.CottageDecor;
  const keys={game:'cockatiel-cottage-save',open:'cockatiel-cottage-open',decor:'cockatiel-cottage-decor-v1'};
  function pack(game,decor){return JSON.stringify({format:'cockatiel-cottage-bundle',version:1,game:C.validateState(game),decor:D.validateImport(decor)},null,2);}
  function parse(raw){
    if(typeof raw!=='string'||raw.length>262144)throw new Error('紀錄檔太大了，請選小屋匯出的備份。');
    let value;try{value=JSON.parse(raw);}catch(_){throw new Error('這個檔案讀不到，原本的紀錄先保留。');}
    if(value?.format==='cockatiel-cottage-bundle'){
      if(value.version!==1||Object.keys(value).length!==4||Object.keys(value).some(k=>!['format','version','game','decor'].includes(k)))throw new Error('還不支援這種備份格式，請保留原檔。');
      return {game:C.parseSave(JSON.stringify(value.game)),decor:D.validateImport(value.decor)};
    }
    return {game:C.parseSave(raw),decor:null};
  }
  function apply(bundle){
    const game=C.validateState(bundle.game),decor=bundle.decor===null?null:D.validateImport(bundle.decor);
    const sessionOpen=!game.safeMode&&game.stage<4,store=root.localStorage;
    const target=decor===null?[keys.game,keys.open]:[keys.game,keys.open,keys.decor];
    const previous=target.map(key=>[key,store.getItem(key)]),runtime=D.captureRuntime();
    try{
      store.setItem(keys.game,C.serialize(game));store.setItem(keys.open,sessionOpen?'active':'closed');
      if(decor!==null&&!D.applyImport(decor).saved)throw new Error('布置還沒存好');
      return {game,sessionOpen};
    }catch(cause){
      let rollbackFailed=false;
      for(const [key,value]of previous){try{if(store.getItem(key)!==value){if(value===null)store.removeItem(key);else store.setItem(key,value);}}catch(_){rollbackFailed=true;}}
      try{D.restoreRuntime(runtime);}catch(_){rollbackFailed=true;}
      const error=new Error(rollbackFailed?'這次沒有完整存好，有些資料也沒能還原。請先備份，再重新載入檢查。':'這次還沒存好，已還原原本的紀錄。請保留備份，再試一次。');
      error.rollbackFailed=rollbackFailed;error.cause=cause;throw error;
    }
  }
  root.CottageBackup=Object.freeze({pack,parse,apply});
})(globalThis);
