(function(){
  'use strict';

  var STYLE_ID='kitoku-badge-style';

  function normalizeBirth(v){
    var raw=String(v||'').trim().replace(/\//g,'-');
    var m=raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(!m) return raw;
    return m[1]+'-'+String(Number(m[2])).padStart(2,'0')+'-'+String(Number(m[3])).padStart(2,'0');
  }

  function isValidBirthDate(y,m,d){
    y=parseInt(y,10);m=parseInt(m,10);d=parseInt(d,10);
    if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d))return false;
    if(y<1900||y>2100)return false;
    if(m<1||m>12)return false;
    if(d<1||d>31)return false;
    var dt=new Date(y,m-1,d);
    return dt.getFullYear()===y&&dt.getMonth()===(m-1)&&dt.getDate()===d;
  }

  var PAIR_STARS={
    1:{k:'一白水星',e:'水',nature:'水'},
    2:{k:'二黒土星',e:'土',nature:'大地'},
    3:{k:'三碧木星',e:'木',nature:'雷と新緑'},
    4:{k:'四緑木星',e:'木',nature:'風'},
    5:{k:'五黄土星',e:'土',nature:'中心'},
    6:{k:'六白金星',e:'金',nature:'天'},
    7:{k:'七赤金星',e:'金',nature:'実り'},
    8:{k:'八白土星',e:'土',nature:'山'},
    9:{k:'九紫火星',e:'火',nature:'火'}
  };

  function calcPairHonmei(y,m){
    y=Number(y)||0;
    m=Number(m)||0;
    if(!y||!m) return 0;
    var ky=(m<=2)?y-1:y;
    var ds=(ky%9+9)%9||9;
    return ((11-ds-1)%9+9)%9+1;
  }

  function getEl(id){
    return document.getElementById(id);
  }

  function getPairConfig(){
    var path=(location.pathname||'').split('/').pop();
    if(path==='relations.html'){
      return {
        kind:'relations',
        pageLabel:'相性を見る二人',
        myLabel:'あなた',
        partnerLabel:'相手',
        myY:'mY', myM:'mM', myD:'mD',
        partnerName:'pName', partnerY:'pY', partnerM:'pM', partnerD:'pD'
      };
    }
    if(path==='business.html'){
      return {
        kind:'business',
        pageLabel:'仕事で見る二人',
        myLabel:'あなた側',
        partnerLabel:'相手側',
        myY:'myYear', myM:'myMonth', myD:'myDay',
        partnerName:'candidateName', partnerY:'cYear', partnerM:'cMonth', partnerD:'cDay'
      };
    }
    return null;
  }

  function getPairSide(yId,mId,dId,nameId,label){
    var y=getEl(yId), m=getEl(mId), d=getEl(dId), n=nameId?getEl(nameId):null;
    var yy=y?Number(y.value)||0:0;
    var mm=m?Number(m.value)||0:0;
    var dd=d?Number(d.value)||0:0;
    var name=n?String(n.value||'').trim():'';
    var hasAny=!!(yy||mm||dd);
    var valid=yy&&mm&&dd&&isValidBirthDate(yy,mm,dd);
    var invalid=hasAny&&!valid;
    var starNo=valid?calcPairHonmei(yy,mm):0;
    var star=starNo?PAIR_STARS[starNo]:null;
    var birth=hasAny?(String(yy||'?')+'.'+String(mm||'?')+'.'+String(dd||'?')):'';
    return {label:label,name:name,birth:birth,starNo:starNo,star:star,invalid:invalid};
  }

  function pairSideText(side){
    var who=side.name||side.label;
    if(side.invalid) return who+'：日付が正しくありません';
    if(side.star) return who+'：'+(side.birth||'生年月日未入力')+'（'+side.star.k+'）';
    return who+'：未入力';
  }

  function getPairState(cfg){
    var me=getPairSide(cfg.myY,cfg.myM,cfg.myD,null,cfg.myLabel);
    var partner=getPairSide(cfg.partnerY,cfg.partnerM,cfg.partnerD,cfg.partnerName,cfg.partnerLabel);
    var complete=!!(me.star && partner.star);
    var invalid=!!(me.invalid||partner.invalid);
    var label=invalid ? '生年月日が正しくありません' : (complete ? me.star.k+' × '+partner.star.k+' の関係を見ています' : '相性を見る二人を入力してください');
    var desc=pairSideText(me)+' × '+pairSideText(partner);
    var detail='';
    if(complete){
      detail=(me.name||cfg.myLabel)+'（'+me.star.nature+'） × '+(partner.name||cfg.partnerLabel)+'（'+partner.star.nature+'）';
    }else if(invalid){
      detail='実在する日付を入力すると、二人の星を表示します。全体の本人データは上書きしません。';
    }else{
      detail='入力欄の生年月日を変えると、この表示も自動で変わります。全体の本人データは上書きしません。';
    }
    return {kind:'pair',label:label,birth:desc,desc:detail,pageLabel:cfg.pageLabel};
  }

  function getStorage(key){
    try{return localStorage.getItem(key)||'';}catch(e){return '';}
  }

  function setStorage(key,val){
    try{localStorage.setItem(key,val);}catch(e){}
  }

  function clearPartner(){
    try{
      localStorage.removeItem('kitoku-view-mode');
      localStorage.removeItem('kitoku-partner-name');
      localStorage.removeItem('kitoku-partner-birth');
    }catch(e){}
  }

  function getCurrentBirth(){
    var raw=getStorage('kitoku-birth')||getStorage('kitoku_birth');
    var normalized=normalizeBirth(raw);
    if(normalized && raw!==normalized) setStorage('kitoku-birth', normalized);
    return normalized;
  }

  function getReading(){
    try{
      var raw=localStorage.getItem('kitoku-life-reading');
      if(!raw) return null;
      return JSON.parse(raw);
    }catch(e){
      return null;
    }
  }

  function getState(){
    var mode=getStorage('kitoku-view-mode');
    var partnerName=getStorage('kitoku-partner-name');
    var partnerBirth=normalizeBirth(getStorage('kitoku-partner-birth'));
    if(mode==='partner' && (partnerName || partnerBirth)){
      return {
        kind:'partner',
        label:(partnerName||'お相手')+' さん（お相手）',
        birth:partnerBirth,
        desc:'人間関係で見ている相手です。'
      };
    }

    var birth=getCurrentBirth();
    var reading=getReading();
    var readingBirth=reading && typeof reading.birth==='string' ? normalizeBirth(reading.birth) : '';
    var readingName=reading && reading.name ? String(reading.name) : '';

    if(readingName && birth && readingBirth && readingBirth===birth){
      return {
        kind:'self',
        label:readingName+' さん（ご本人）',
        birth:birth,
        desc:'姓名鑑定と生年月日が一致しています。'
      };
    }

    if(birth){
      return {
        kind:'warn',
        label:'生年月日は登録済み・姓名鑑定はまだです',
        birth:birth,
        desc:'今の生年月日と一致する姓名鑑定を行うと、名前と星を安全に照合できます。'
      };
    }

    return {
      kind:'warn',
      label:'生年月日が未登録です',
      birth:'',
      desc:'生年月日を登録すると、各画面で同じ人を見ているか確認できます。'
    };
  }

  function injectStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var css=[
      '#kitoku-badge-mount{max-width:480px;margin:0 auto;background:transparent;}',
      '.kitoku-badge{font-family:inherit;padding:8px 14px 0;color:#3b2a16;}',
      '.kitoku-badge details{border-radius:14px;overflow:hidden;border:1px solid rgba(138,104,32,.22);box-shadow:0 8px 22px rgba(80,58,20,.06);}',
      '.kitoku-badge summary{list-style:none;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:9px;padding:9px 11px;cursor:pointer;}',
      '.kitoku-badge summary::-webkit-details-marker{display:none;}',
      '.kitoku-badge-ico{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;font-size:.78rem;font-weight:800;background:rgba(255,255,255,.66);}',
      '.kitoku-badge-main{min-width:0;}',
      '.kitoku-badge-kicker{display:block;font-size:.48rem;letter-spacing:.16em;font-weight:800;line-height:1.3;opacity:.78;margin-bottom:2px;}',
      '.kitoku-badge-name{display:block;font-size:.68rem;font-weight:800;line-height:1.55;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.kitoku-badge-chevron{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.72);font-size:.64rem;font-weight:900;transition:transform .18s ease;}',
      '.kitoku-badge details[open] .kitoku-badge-chevron{transform:rotate(180deg);}',
      '.kitoku-badge-body{padding:0 12px 11px 46px;font-size:.6rem;line-height:1.75;}',
      '.kitoku-badge-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px;}',
      '.kitoku-badge-actions a,.kitoku-badge-actions button{appearance:none;border:1px solid rgba(0,0,0,.12);border-radius:999px;background:rgba(255,255,255,.72);color:inherit;text-decoration:none;font-family:inherit;font-size:.58rem;font-weight:800;padding:6px 10px;cursor:pointer;}',
      '.kitoku-badge.is-self details{background:linear-gradient(135deg,rgba(255,250,238,.98),rgba(255,255,255,.86));border-color:rgba(186,117,23,.3);}',
      '.kitoku-badge.is-self .kitoku-badge-ico,.kitoku-badge.is-self .kitoku-badge-chevron{color:#BA7517;border:1px solid rgba(186,117,23,.22);}',
      '.kitoku-badge.is-self .kitoku-badge-kicker,.kitoku-badge.is-self .kitoku-badge-name{color:#8a5b12;}',
      '.kitoku-badge.is-partner details{background:#FDF0F4;border-color:rgba(153,53,86,.28);}',
      '.kitoku-badge.is-partner .kitoku-badge-body{color:#6d2a41;}',
      '.kitoku-badge.is-partner .kitoku-badge-ico,.kitoku-badge.is-partner .kitoku-badge-chevron{color:#993556;border:1px solid rgba(153,53,86,.22);}',
      '.kitoku-badge.is-partner .kitoku-badge-kicker,.kitoku-badge.is-partner .kitoku-badge-name{color:#993556;}',
      '.kitoku-badge.is-warn details{background:#FBF4E4;border-color:rgba(133,79,11,.32);}',
      '.kitoku-badge.is-warn .kitoku-badge-ico,.kitoku-badge.is-warn .kitoku-badge-chevron{color:#854F0B;border:1px solid rgba(133,79,11,.24);}',
      '.kitoku-badge.is-warn .kitoku-badge-kicker,.kitoku-badge.is-warn .kitoku-badge-name{color:#854F0B;}',
      '@media print{#kitoku-badge-mount{display:none!important;}}'
    ].join('');
    var st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=css;
    document.head.appendChild(st);
  }

  function render(){
    var mount=document.getElementById('kitoku-badge-mount');
    if(!mount) return;
    injectStyle();
    var pairConfig=getPairConfig();
    var state=pairConfig?getPairState(pairConfig):getState();
    var cls=state.kind==='self'?'is-self':state.kind==='partner'?'is-partner':state.kind==='pair'?'is-partner':'is-warn';
    var icon=state.kind==='self'?'人':state.kind==='partner'?'縁':state.kind==='pair'?'縁':'!';
    var kicker=state.kind==='self'?'いま見ているのは':state.kind==='partner'?'いま見ている相手':state.kind==='pair'?state.pageLabel:'確認が必要です';
    var birthHtml=state.kind==='pair' ? state.birth : (state.birth ? '生年月日：'+state.birth : '生年月日：未登録');
    var actions='';
    if(state.kind==='partner'){
      actions='<button type="button" data-kitoku-badge-self>本人に戻す</button><a href="relations.html">人を切り替える</a>';
    }else if(state.kind==='pair'){
      actions='<span style="font-size:.58rem;font-weight:800;">この画面の入力だけで表示しています</span>';
    }else if(state.kind==='self'){
      actions='<a href="life.html">姓名鑑定を確認</a><a href="top.html">入口へ戻る</a>';
    }else{
      actions='<a href="life.html">この生年月日で姓名鑑定をする</a><a href="top.html">生年月日を確認</a>';
    }
    mount.innerHTML=
      '<div class="kitoku-badge '+cls+'">'+
        '<details>'+
          '<summary>'+
            '<span class="kitoku-badge-ico">'+icon+'</span>'+
            '<span class="kitoku-badge-main">'+
              '<span class="kitoku-badge-kicker">'+kicker+'</span>'+
              '<span class="kitoku-badge-name">'+state.label+'</span>'+
            '</span>'+
            '<span class="kitoku-badge-chevron">▼</span>'+
          '</summary>'+
          '<div class="kitoku-badge-body">'+
            '<div>'+birthHtml+'</div>'+
            '<div>'+state.desc+'</div>'+
            '<div class="kitoku-badge-actions">'+actions+'</div>'+
          '</div>'+
        '</details>'+
      '</div>';
    var btn=mount.querySelector('[data-kitoku-badge-self]');
    if(btn){
      btn.addEventListener('click',function(){
        clearPartner();
        render();
      });
    }
  }

  function bindPairInputs(){
    var cfg=getPairConfig();
    if(!cfg) return;
    [cfg.myY,cfg.myM,cfg.myD,cfg.partnerName,cfg.partnerY,cfg.partnerM,cfg.partnerD].forEach(function(id){
      var el=getEl(id);
      if(el && !el.dataset.kitokuBadgeBound){
        el.dataset.kitokuBadgeBound='1';
        el.addEventListener('input',render);
        el.addEventListener('change',render);
      }
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){bindPairInputs();render();});
  }else{
    bindPairInputs();
    render();
  }
  window.addEventListener('storage',render);
  window.KitokuBadge={render:render,normalizeBirth:normalizeBirth};
})();