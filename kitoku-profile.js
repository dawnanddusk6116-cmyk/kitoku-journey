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

  global.getKitokuProfile=getKitokuProfile;
  global.saveKitokuProfile=saveKitokuProfile;
})(window);
