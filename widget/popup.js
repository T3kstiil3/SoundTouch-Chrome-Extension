document.addEventListener('DOMContentLoaded', function() {

  var xhr = new XMLHttpRequest();
  var settings;

  //ELEMENT
  var loaderSettings = document.getElementById("loaderSettings");
  var loaderInformations = document.getElementById("loaderInformations");
  var setSettingsMessage = document.getElementById("setSettingsMessage");
  var settings_btn = document.getElementById('settings_btn');
  var settings_btn2 = document.getElementById('settings_btn2');
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

          document.getElementById("track").innerText = track;
          document.getElementById("artist").innerText = artist;
          document.getElementById("album").innerText = album;
          document.getElementById("cover").src = art;

          loader.style.display = 'none';
          loaderInformations.style.display = 'none';
          main.style.display = 'block';
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

  //Button List
  var buttonRemote = document.getElementsByClassName("buttonRemote");
  for (var i = 0; i < buttonRemote.length; i++) {
    buttonRemote[i].addEventListener('click', sendRemoteButton, false);
  }

  //Send Remote Button with key parameter
  function sendRemoteButton(){
    var key = this.value;
    var url = 'http://10.0.10.166:8090/key';
    xhr.open("POST", url, true);
    xhr.send('<?xml version="1.0" encoding="UTF-8" ?><key state="press" sender="Gabbo">'+key+'</key>');
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
