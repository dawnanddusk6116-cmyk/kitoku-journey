// KITOKU profile storage helpers (Phase 1)
(function(global){
  function normalizeKitokuProfileBirth(v){
    var raw=String(v||'').trim().replace(/\//g,'-');
    var m=raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(!m)return raw;
    return m[1]+'-'+String(Number(m[2])).padStart(2,'0')+'-'+String(Number(m[3])).padStart(2,'0');
  }

  function getKitokuProfile(){
    try{
      var raw=localStorage.getItem('kitoku-profile');
      if(raw){
        var data=JSON.parse(raw);
        if(data&&data.birth)return data;
      }
    }catch(e){}
    try{
      var birth=localStorage.getItem('kitoku-birth')||localStorage.getItem('kitoku_birth')||'';
      var gender=localStorage.getItem('kitoku-gender')||'';
      var birthTime=localStorage.getItem('kitoku-birth-time')||'';
      if(birth)return {version:1,birth:normalizeKitokuProfileBirth(birth),gender:gender,birthTime:birthTime,updatedAt:null};
    }catch(e){}
    return null;
  }

  function saveKitokuProfile(data){
    data=data||{};
    var profile={
      version:1,
      birth:normalizeKitokuProfileBirth(data.birth||''),
      gender:data.gender||'',
      birthTime:data.birthTime||'',
      updatedAt:Date.now()
    };
    try{localStorage.setItem('kitoku-profile',JSON.stringify(profile));}catch(e){}
    try{
      if(profile.birth)localStorage.setItem('kitoku-birth',profile.birth);
      if(profile.gender)localStorage.setItem('kitoku-gender',profile.gender);
      if(profile.birthTime)localStorage.setItem('kitoku-birth-time',profile.birthTime);
    }catch(e){}
    return profile;
  }

  function getKitokuStarProfile(profile){
    profile=profile||getKitokuProfile();
    if(!profile||!profile.birth)return null;
    var birth=normalizeKitokuProfileBirth(profile.birth);
    var parts=birth.split('-').map(Number);
    if(parts.length!==3||!parts[0]||!parts[1]||!parts[2])return null;
    var by=parts[0],bm=parts[1],bd=parts[2];
    var gender=profile.gender||'';
    if(typeof global.getKD!=='function'||typeof global.calcHonmei!=='function'||
       typeof global.calcTsukimei!=='function'||typeof global.calcNayin!=='function'||
       typeof global.calcKeisha!=='function'||typeof global.calcDokai!=='function'){
      if(typeof global.calcH==='function'&&typeof global.calcT==='function'){
        var honmeiFallback=global.calcH(by,bm,bd);
        var tsukimeiFallback=global.calcT(by,bm,bd);
        var nainFallback='';
        try{nainFallback=localStorage.getItem('kitoku_nain')||'';}catch(e){}
        return {
          birth:birth,
          gender:gender,
          kY:null,
          kM:null,
          honmei:honmeiFallback,
          tsukimei:tsukimeiFallback,
          keisha:null,
          dokai:null,
          nain:nainFallback,
          yearNayin:nainFallback?{n:nainFallback}:null,
          monthNayin:null,
          tFK:null
        };
      }
      return null;
    }
    var kd=global.getKD(by,bm,bd);
    var honmei=global.calcHonmei(kd.kY);
    var tsukimei=global.calcTsukimei(honmei,kd.kM);
    var tFK=tsukimei;
    if(honmei===tsukimei){
      var taichuu={1:9,2:8,3:4,4:3,6:2,7:1,8:7,9:1};
      tFK=(honmei===5)?(gender==='female'?6:7):(taichuu[honmei]||tsukimei);
    }
    var keisha=global.calcKeisha(honmei,tFK);
    var dokai=global.calcDokai(honmei,tFK);
    var yearNayin=global.calcNayin(kd.kY);
    var monthNayin=(typeof global.calcMonthNayin==='function')?global.calcMonthNayin(by,bm,bd):null;
    return {
      birth:birth,
      gender:gender,
      kY:kd.kY,
      kM:kd.kM,
      honmei:honmei,
      tsukimei:tsukimei,
      keisha:keisha,
      dokai:dokai,
      nain:yearNayin&&yearNayin.n?yearNayin.n:'',
      yearNayin:yearNayin,
      monthNayin:monthNayin,
      tFK:tFK
    };
  }

  global.getKitokuProfile=getKitokuProfile;
  global.saveKitokuProfile=saveKitokuProfile;
  global.getKitokuStarProfile=getKitokuStarProfile;
})(window);
