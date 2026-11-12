/**
 * 緬懷步道：Google 試算表後端（網頁已接上，部署網址填在 src/data.js 的 SHEET_API）
 *
 * 用法：
 * 1. 建立一個新的 Google 試算表（標題列會自動建立：id | uid | nick | outfit | type | aid | kind | msg | at | hidden）
 * 2. 試算表選單「擴充功能 → Apps Script」，把這個檔案貼進去。
 * 3. 「部署 → 新增部署作業 → 網頁應用程式」，執行身分選「我」，存取權選「所有人」。
 * 4. 複製部署網址（…/exec 結尾），填到 src/data.js 最上面的 SHEET_API，再執行 build.py。
 *    之後改了這個檔案，要「部署 → 管理部署作業 → 編輯 → 版本選新版本」，網址才會用到新程式。
 *
 * type：lantern（點燈籠，可留言）、bloom（獻花）、doll（獻偶，kind = elephant / lion）、wish（祈福樹的祈福牌，aid 固定 tree，可寫 50 字）
 * 同一個 uid 對同一隻動物（aid）的同一種 type 只保留一列，再送一次就是更新。
 * 改名字：{action:'rename', uid, nick} 會把這個人所有列的 nick 一起改掉。
 * 要刪除不適當的留言：把那一列的 hidden 欄填 1（或直接刪掉那一列）。
 */
const SHEET_NAME = '工作表1';
const ANIMALS = ['mimi','dajie','ali','zhaohai','erge','mary'];
const TYPES = ['lantern','bloom','doll','wish'];

const HEAD = ['id','uid','nick','outfit','type','aid','kind','msg','at','hidden'];

// 找工作表：有「工作表1」就用它，沒有就用第一個工作表；第一列沒標題時自動補上
function sheet_() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (sh.getLastRow() === 0 || String(sh.getRange(1,1).getValue()) !== 'id') {
    if (sh.getLastRow() === 0) sh.appendRow(HEAD); else { sh.insertRowBefore(1); sh.getRange(1,1,1,HEAD.length).setValues([HEAD]); }
    sh.setFrozenRows(1);
  }
  return sh;
}

// 第一次在編輯器手動執行這個函式：完成授權，並建好標題列
function setup() { sheet_(); }

function doGet() {
  const rows = sheet_().getDataRange().getValues();   // 第一列一定是標題（sheet_ 會補）
  const head = rows.shift();
  const out = rows.map(r => Object.fromEntries(head.map((h,i)=>[h, r[i]])))
                  .filter(r => r.id && !r.hidden)
                  .map(({hidden, ...r}) => r);   // hidden 填 1 的不會送到網頁
  return ContentService.createTextOutput(JSON.stringify({rows: out}))
    .setMimeType(ContentService.MimeType.JSON);
}

// 網頁用 fetch(url, {method:'POST', body: JSON.stringify(...)}) 送進來（不設 Content-Type，避免跨網域預檢）
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    const d = JSON.parse((e.postData && e.postData.contents) || '{}');
    const uid = String(d.uid||'');
    if (!/^[A-Za-z0-9_-]{6,40}$/.test(uid)) return json_({ok:false, error:'bad_uid'});
    const sh = sheet_(), data = sh.getDataRange().getValues(), head = data[0];
    const nick = text_(d.nick, 12) || '旅人';

    if (d.action === 'rename') {
      const uidCol = head.indexOf('uid'), nickCol = head.indexOf('nick');
      for (let i = 1; i < data.length; i++) if (data[i][uidCol] === uid) sh.getRange(i+1, nickCol+1).setValue(nick);
      return json_({ok:true});
    }

    const aid = String(d.aid||''), type = String(d.type||'');
    const okAid = type === 'wish' ? aid === 'tree' : ANIMALS.includes(aid);
    if (!okAid || !TYPES.includes(type)) return json_({ok:false, error:'bad_request'});
    const row = {
      id: uid+'|'+type+'|'+aid, uid, aid, type, nick,
      outfit: text_(d.outfit, 20),
      kind: type==='doll' ? (d.kind==='lion'?'lion':'elephant') : '',
      msg: type==='lantern' ? text_(d.msg, 40) : type==='wish' ? text_(d.msg, 50) : '',
      at: Date.now(), hidden: ''
    };
    const idCol = head.indexOf('id');
    const found = data.findIndex((r,i) => i>0 && r[idCol]===row.id);
    if (found > 0) {
      row.hidden = data[found][head.indexOf('hidden')];   // 已被隱藏的，更新後仍保持隱藏
      sh.getRange(found+1, 1, 1, head.length).setValues([head.map(h => row[h] ?? '')]);
    } else sh.appendRow(head.map(h => row[h] ?? ''));
    return json_({ok:true});
  } catch (err) {
    return json_({ok:false, error:'server'});
  } finally { lock.releaseLock(); }
}

// 訪客輸入的文字：去掉換行、限制字數；「= + - @」開頭的前面加 '，避免試算表把它當成公式執行
function text_(v, n) {
  let s = String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
