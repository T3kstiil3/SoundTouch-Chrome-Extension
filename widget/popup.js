document.addEventListener('DOMContentLoaded', function() {

  var xhr = new XMLHttpRequest();

  getNowPlaying();

  //Now Playing display
  function getNowPlaying(){
    var url = 'http://10.0.10.166:8090/now_playing';
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
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
        }
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
  var settings_btn = document.getElementById('settings_btn');
  settings_btn.addEventListener('click', function() {
    console.log('gotosettings');
  });

});
