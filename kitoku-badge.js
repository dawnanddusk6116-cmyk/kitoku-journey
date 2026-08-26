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

  var SEKKI_DAYS={1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:7,9:8,10:8,11:7,12:7};
  var SEKKI_DB={1924:{1:6,2:5,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1925:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:7},1926:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1927:{1:6,2:5,3:6,4:6,5:6,6:7,7:8,8:8,9:9,10:9,11:8,12:8},1928:{1:6,2:5,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1929:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:7},1930:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1931:{1:6,2:5,3:6,4:6,5:6,6:7,7:8,8:8,9:9,10:9,11:8,12:8},1932:{1:6,2:5,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1933:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1934:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1935:{1:6,2:5,3:6,4:6,5:6,6:7,7:8,8:8,9:8,10:9,11:8,12:8},1936:{1:6,2:5,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1937:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1938:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1939:{1:6,2:5,3:6,4:6,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1940:{1:6,2:5,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1941:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1942:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1943:{1:6,2:5,3:6,4:6,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1944:{1:6,2:5,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1945:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1946:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1947:{1:6,2:5,3:6,4:6,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1948:{1:6,2:5,3:6,4:5,5:5,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1949:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1950:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1951:{1:6,2:5,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1952:{1:6,2:5,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},1953:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1954:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1955:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1956:{1:6,2:5,3:5,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},1957:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1958:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:7},1959:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1960:{1:6,2:5,3:5,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},1961:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1962:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1963:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1964:{1:6,2:5,3:5,4:5,5:5,6:6,7:7,8:7,9:7,10:8,11:7,12:7},1965:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1966:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1967:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1968:{1:6,2:5,3:5,4:5,5:5,6:6,7:7,8:7,9:7,10:8,11:7,12:7},1969:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1970:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1971:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1972:{1:6,2:5,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},1973:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1974:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1975:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1976:{1:6,2:5,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},1977:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},1978:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1979:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1980:{1:6,2:5,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},1981:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},1982:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1983:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1984:{1:6,2:5,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},1985:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},1986:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1987:{1:6,2:4,3:6,4:5,5:6,6:6,7:8,8:8,9:8,10:9,11:8,12:8},1988:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},1989:{1:5,2:4,3:5,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},1990:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1991:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1992:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},1993:{1:5,2:4,3:5,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},1994:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1995:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},1996:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},1997:{1:5,2:4,3:5,4:5,5:5,6:6,7:7,8:7,9:7,10:8,11:7,12:7},1998:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},1999:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},2000:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2001:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2002:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},2003:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},2004:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2005:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2006:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},2007:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},2008:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2009:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2010:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2011:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:9,11:8,12:7},2012:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2013:{1:5,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2014:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2015:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},2016:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2017:{1:5,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2018:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2019:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},2020:{1:6,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2021:{1:5,2:3,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2022:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2023:{1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:8,12:7},2024:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:7},2025:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2026:{1:5,2:4,3:5,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2027:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:7,9:7,10:8,11:7,12:7},2028:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:7,11:7,12:6},2029:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2030:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2031:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},2032:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:6},2033:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2034:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2035:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},2036:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:6},2037:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2038:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2039:{1:5,2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7},2040:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:6},2041:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2042:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2043:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2044:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:6},2045:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2046:{1:5,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2047:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2048:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:7,11:7,12:6},2049:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2050:{1:5,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2051:{1:5,2:4,3:6,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2052:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:7,11:7,12:6},2053:{1:5,2:3,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:7},2054:{1:5,2:4,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2055:{1:5,2:4,3:5,4:5,5:5,6:6,7:7,8:7,9:8,10:8,11:7,12:7},2056:{1:6,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:7,11:7,12:6},2057:{1:5,2:3,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:7},2058:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2059:{1:5,2:4,3:5,4:5,5:5,6:6,7:7,8:7,9:7,10:8,11:7,12:7},2060:{1:5,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:7,11:7,12:6},2061:{1:5,2:3,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:8,11:7,12:6},2062:{1:5,2:3,3:5,4:4,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2063:{1:5,2:4,3:5,4:5,5:5,6:5,7:7,8:7,9:7,10:8,11:7,12:7},2064:{1:5,2:4,3:5,4:4,5:5,6:5,7:6,8:7,9:7,10:7,11:6,12:6}};
  function getSekkiDay(y,m){if(SEKKI_DB[y]&&SEKKI_DB[y][m])return SEKKI_DB[y][m];const A={1:6,2:4,3:6,4:5,5:6,6:6,7:7,8:7,9:8,10:8,11:7,12:7};const key=y+'-'+m;getSekkiDay._warned=getSekkiDay._warned||{};if(!getSekkiDay._warned[key]&&typeof console!=='undefined'&&console.warn){console.warn('[KITOKU] SEKKI_DB range missing; fallback used',{year:y,month:m});getSekkiDay._warned[key]=true;}return A[m]||1;}
  function getKigakuYear(y,m,d){
    y=Number(y)||0;m=Number(m)||0;d=Number(d)||1;
    if(!y||!m)return 0;
    var sd=getSekkiDay(y,m);
    if(d<sd)return m<=2?y-1:y;
    return m===1?y-1:y;
  }
  function calcPairHonmei(y,m,d){
    var ky=getKigakuYear(y,m,d);
    if(!ky)return 0;
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
    var starNo=valid?calcPairHonmei(yy,mm,dd):0;
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
      localStorage.removeItem('kitoku-target-name');
      localStorage.removeItem('kitoku-target-birth');
      localStorage.removeItem('kitoku-target-desc');
    }catch(e){}
  }

  function escapeHtml(v){
    return String(v||'').replace(/[&<>"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function formatBirth(v){
    var b=normalizeBirth(v);
    var m=b.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return b||'';
    return Number(m[1])+'年'+Number(m[2])+'月'+Number(m[3])+'日';
  }

  function getGenderLabel(){
    var g=getStorage('kitoku-gender')||getStorage('kitoku_gender');
    if(g==='male'||g==='m'||g==='男性') return '男性';
    if(g==='female'||g==='f'||g==='女性') return '女性';
    return '';
  }

  function birthSubline(birth, gender){
    var label=formatBirth(birth);
    if(!label) return '生年月日：未登録';
    return gender ? label+'・'+gender : label;
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
    var targetName=getStorage('kitoku-target-name');
    var targetBirth=normalizeBirth(getStorage('kitoku-target-birth'));
    var targetDesc=getStorage('kitoku-target-desc');
    if(mode==='target' && (targetName || targetBirth)){
      return {
        kind:'target',
        label:(targetName||'他の人')+' さん（他の人を確認中）',
        birth:targetBirth,
        sub:birthSubline(targetBirth,''),
        desc:targetDesc || '本人ではない名前・生年月日を確認しています。終わったら「本人に戻す」を押してください。'
      };
    }

    var partnerName=getStorage('kitoku-partner-name');
    var partnerBirth=normalizeBirth(getStorage('kitoku-partner-birth'));
    if(mode==='partner' && (partnerName || partnerBirth)){
      return {
        kind:'partner',
        label:(partnerName||'お相手')+' さん（お相手）',
        birth:partnerBirth,
        sub:birthSubline(partnerBirth,''),
        desc:'人間関係で見ている相手です。'
      };
    }

    var birth=getCurrentBirth();
    var gender=getGenderLabel();
    var reading=getReading();
    var readingBirth=reading && typeof reading.birth==='string' ? normalizeBirth(reading.birth) : '';
    var readingName=reading && reading.name ? String(reading.name) : '';
    var readingMode=reading && reading.mode ? String(reading.mode) : '';

    if(readingMode==='other'){
      return {
        kind:'target',
        label:(readingName||'他の人')+' さん（他の人を確認中）',
        birth:readingBirth,
        sub:birthSubline(readingBirth,''),
        desc:'姓名鑑定の「他の人」モードで確認した対象です。本人データは上書きしていません。'
      };
    }

    if(readingName && birth && readingBirth && readingBirth===birth){
      return {
        kind:'self',
        label:readingName+' さん（ご本人）',
        birth:birth,
        sub:birthSubline(birth,gender),
        desc:'姓名鑑定と生年月日が一致しています。'
      };
    }

    if(birth){
      return {
        kind:'self',
        label:'ご本人（姓名未確認）',
        birth:birth,
        sub:birthSubline(birth,gender),
        desc:'生年月日は登録済みです。姓名鑑定を行うと、名前と星を照合できます。'
      };
    }

    return {
      kind:'warn',
      label:'生年月日が未登録です',
      birth:'',
      sub:'生年月日：未登録',
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
      '.kitoku-badge-name{display:block;font-size:.68rem;font-weight:800;line-height:1.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.kitoku-badge-sub{display:block;font-size:.56rem;line-height:1.35;opacity:.82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '.kitoku-badge-chevron{width:26px;height:26px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.72);font-size:.64rem;font-weight:900;transition:transform .18s ease;}',
      '.kitoku-badge details[open] .kitoku-badge-chevron{transform:rotate(180deg);}',
      '.kitoku-badge-body{padding:0 12px 11px 46px;font-size:.6rem;line-height:1.75;}',
      '.kitoku-badge-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px;}',
      '.kitoku-badge-actions a,.kitoku-badge-actions button{appearance:none;border:1px solid rgba(0,0,0,.12);border-radius:999px;background:rgba(255,255,255,.72);color:inherit;text-decoration:none;font-family:inherit;font-size:.58rem;font-weight:800;padding:6px 10px;cursor:pointer;}',
      '.kitoku-badge.is-self details{background:linear-gradient(135deg,rgba(255,250,238,.98),rgba(255,255,255,.86));border-color:rgba(186,117,23,.3);}',
      '.kitoku-badge.is-self .kitoku-badge-ico,.kitoku-badge.is-self .kitoku-badge-chevron{color:#BA7517;border:1px solid rgba(186,117,23,.22);}',
      '.kitoku-badge.is-self .kitoku-badge-kicker,.kitoku-badge.is-self .kitoku-badge-name{color:#8a5b12;}',
      '.kitoku-badge.is-partner details,.kitoku-badge.is-target details{background:#FDF0F4;border-color:rgba(153,53,86,.28);}',
      '.kitoku-badge.is-partner .kitoku-badge-body,.kitoku-badge.is-target .kitoku-badge-body{color:#6d2a41;}',
      '.kitoku-badge.is-partner .kitoku-badge-ico,.kitoku-badge.is-partner .kitoku-badge-chevron,.kitoku-badge.is-target .kitoku-badge-ico,.kitoku-badge.is-target .kitoku-badge-chevron{color:#993556;border:1px solid rgba(153,53,86,.22);}',
      '.kitoku-badge.is-partner .kitoku-badge-kicker,.kitoku-badge.is-partner .kitoku-badge-name,.kitoku-badge.is-partner .kitoku-badge-sub,.kitoku-badge.is-target .kitoku-badge-kicker,.kitoku-badge.is-target .kitoku-badge-name,.kitoku-badge.is-target .kitoku-badge-sub{color:#993556;}',
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
    var cls=state.kind==='self'?'is-self':state.kind==='partner'?'is-partner':state.kind==='target'?'is-target':state.kind==='pair'?'is-partner':'is-warn';
    var icon=state.kind==='self'?'人':state.kind==='partner'?'縁':state.kind==='target'?'他':state.kind==='pair'?'縁':'!';
    var kicker=state.kind==='self'?'いま見ているのは':state.kind==='partner'?'いま見ている相手':state.kind==='target'?'いま確認しているのは':state.kind==='pair'?state.pageLabel:'確認が必要です';
    var sub=state.sub || (state.kind==='pair' ? state.birth : birthSubline(state.birth,''));
    var birthHtml=state.kind==='pair' ? state.birth : (state.birth ? '生年月日：'+formatBirth(state.birth) : '生年月日：未登録');
    var actions='';
    if(state.kind==='partner'){
      actions='<button type="button" data-kitoku-badge-self>本人に戻す</button><a href="relations.html">人を切り替える</a>';
    }else if(state.kind==='target'){
      actions='<button type="button" data-kitoku-badge-self>本人に戻す</button><a href="life.html">名前を切り替える</a>';
    }else if(state.kind==='pair'){
      actions='<span style="font-size:.58rem;font-weight:800;">この画面の入力だけで表示しています</span>';
    }else if(state.kind==='self'){
      actions='<button type="button" data-kitoku-badge-birth>登録情報を変更</button><a href="life.html">姓名鑑定を確認</a>';
    }else{
      actions='<button type="button" data-kitoku-badge-birth>生年月日を登録する</button><a href="life.html">姓名鑑定を確認</a>';
    }
    mount.innerHTML=
      '<div class="kitoku-badge '+cls+'">'+
        '<details>'+
          '<summary>'+
            '<span class="kitoku-badge-ico">'+icon+'</span>'+
            '<span class="kitoku-badge-main">'+
              '<span class="kitoku-badge-kicker">'+escapeHtml(kicker)+'</span>'+
              '<span class="kitoku-badge-name">'+escapeHtml(state.label)+'</span>'+
              '<span class="kitoku-badge-sub">'+escapeHtml(sub)+'</span>'+
            '</span>'+
            '<span class="kitoku-badge-chevron">▼</span>'+
          '</summary>'+
          '<div class="kitoku-badge-body">'+
            '<div>'+escapeHtml(birthHtml)+'</div>'+
            '<div>'+escapeHtml(state.desc)+'</div>'+
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
    var birthBtn=mount.querySelector('[data-kitoku-badge-birth]');
    if(birthBtn){
      birthBtn.addEventListener('click',function(){
        if(typeof window.changeBirth==='function'){
          window.changeBirth();
          render();
        }else{
          location.href='top.html';
        }
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