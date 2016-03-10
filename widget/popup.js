document.addEventListener('DOMContentLoaded', function() {

  //https://dribbble.com/shots/2282786-Bop-Web-Player/attachments/431768

  var xhr = new XMLHttpRequest();
  var settings;
  var timer;
  var time = 0;
  var totalTime = 0;

  //ELEMENT
  var noSettings = document.getElementById('noSettings');
  var loaderSettings = document.getElementById("loaderSettings");
  var loaderInformations = document.getElementById("loaderInformations");
  var setSettingsMessage = document.getElementById("setSettingsMessage");
  var settings_btn = document.getElementById('settings_btn');
  var settings_btn2 = document.getElementById('settings_btn2');
  var timeInfo = document.getElementsByClassName("timeInfo");
  var progressBar = document.getElementsByClassName("progressBar");
  var loader = document.getElementById("loader");
  var main = document.getElementById("main");

  chrome.storage.sync.get({
    ip: '...'
  }, function(items) {
    settings = items;
    getNowPlaying();
  });

  //Now Playing display
  function getNowPlaying(){
    loaderSettings.style.display = 'none';
    loaderInformations.style.display = 'block';

    var url = 'http://'+settings.ip+':8090/now_playing';
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {

      if (xhr.readyState == 4 && xhr.responseText != "") {
        if (window.DOMParser)
        {
          parser=new DOMParser();
          xmlDoc=parser.parseFromString(xhr.responseText,"text/xml");
          var track = xmlDoc.getElementsByTagName("track")[0].childNodes[0].nodeValue;
          var artist = xmlDoc.getElementsByTagName("artist")[0].childNodes[0].nodeValue;
          var album = xmlDoc.getElementsByTagName("album")[0].childNodes[0].nodeValue;
          var art = xmlDoc.getElementsByTagName("art")[0].childNodes[0].nodeValue;
          time = xmlDoc.getElementsByTagName("time")[0].childNodes[0].nodeValue;
          totalTime = xmlDoc.getElementsByTagName("time")[0].getAttribute("total");

          document.getElementById("track").innerText = track;
          document.getElementById("artist").innerText = artist;
          document.getElementById("album").innerText = album;
          document.getElementById("cover").src = art;

          noSettings.style.display = 'none';
          loaderInformations.style.display = 'none';
          main.style.display = 'block';

          clearInterval(timer);
          timer = setInterval(function() {Horloge();}, 1000);
        }
      }else{
        loaderInformations.style.display = 'none';
        loaderSettings.style.display = "none";
        loader.style.display = "none";
        setSettingsMessage.style.display = "block";
        settings_btn2.style.display = "block";
      }
    }
    xhr.send();
  }

  //Horloge
  function Horloge() {
    time++;
    var minutes = (time - Math.floor(time / 60) * 60); if(minutes < 10){minutes = "0"+minutes}
    var minutesTotal = (totalTime - Math.floor(totalTime / 60) * 60); if(minutesTotal < 10){minutesTotal = "0"+minutesTotal}
    var divTimeMessage = Math.floor(time / 60)+":"+minutes+" / "+Math.floor(totalTime / 60)+":"+minutesTotal;
    var pourcent = time/totalTime*100;
    //Get news informations
    if (time >= totalTime){
      clearInterval(timer);
      getNowPlaying();
    }
    progressBar[0].style.width = pourcent+"%";
    timeInfo[0].innerText = divTimeMessage;
  }

  //Button List
  var buttonRemote = document.getElementsByClassName("buttonRemote");
  for (var i = 0; i < buttonRemote.length; i++) {
    buttonRemote[i].addEventListener('mousedown', sendRemoteButtonPress, false);
    buttonRemote[i].addEventListener('mouseup', sendRemoteButtonRelease, false);
  }

  //Send Remote Button with key parameter Press & Release
  function sendRemoteButtonPress(){
    var key = this.value;
    var url = 'http://10.0.10.166:8090/key';
    xhr.open("POST", url, true);
    xhr.send('<?xml version="1.0" encoding="UTF-8" ?><key state="press" sender="Gabbo">'+key+'</key>');
    setTimeout(function() { getNowPlaying(); }, 2000);
  }
  function sendRemoteButtonRelease(){
    var key = this.value;
    var url = 'http://10.0.10.166:8090/key';
    xhr.open("POST", url, true);
    xhr.send('<?xml version="1.0" encoding="UTF-8" ?><key state="release" sender="Gabbo">'+key+'</key>');
    setTimeout(function() { getNowPlaying(); }, 2000);
  }

  //GO to Settings
  settings_btn.addEventListener('click', function() {openSettingsPage();});
  settings_btn2.addEventListener('click', function() {openSettingsPage();});

  function openSettingsPage(){
    if (chrome.runtime.openOptionsPage) {
     chrome.runtime.openOptionsPage();
    } else {
     window.open(chrome.runtime.getURL('options/options.html'));
    }
  }

});
