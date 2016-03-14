angular
  .module('app', []);

angular
  .module('app')
  .controller('RemoteController', RemoteController);

function RemoteController() {

  var vm = this;

  vm.pushUpButton = pushUpButton;
  vm.pushDownButton = pushDownButton;
  vm.getNowPlaying = getNowPlaying;
  vm.openSettingsPage = openSettingsPage;

  //https://dribbble.com/shots/2282786-Bop-Web-Player/attachments/431768

  var xhr = new XMLHttpRequest();
  var settings;
  var volume;
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
  var volumeBar = document.getElementsByClassName("volumeBar");
  var loader = document.getElementById("loader");
  var main = document.getElementById("main");

  chrome.storage.sync.get({
    ip: '...'
  }, function(items) {
    settings = items;
    getNowPlaying();
  });

  //getVolume
  //:8090/volume
  function getVolume(){
    var url = 'http://'+settings.ip+':8090/volume';
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.responseText != "") {
        if (window.DOMParser)
        {
          parser=new DOMParser();
          var xmlDoc=parser.parseFromString(xhr.responseText,"text/xml");
          volume = xmlDoc.getElementsByTagName("targetvolume")[0].childNodes[0].nodeValue;
          console.log(volume);
          vm.volumeBar = volume;
        }
      }
    }
    xhr.send();
  }

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
          var xmlDoc=parser.parseFromString(xhr.responseText,"text/xml");
          vm.track = xmlDoc.getElementsByTagName("track")[0].childNodes[0].nodeValue;
          vm.artist  = xmlDoc.getElementsByTagName("artist")[0].childNodes[0].nodeValue;
          vm.album = xmlDoc.getElementsByTagName("album")[0].childNodes[0].nodeValue;
          vm.art = xmlDoc.getElementsByTagName("art")[0].childNodes[0].nodeValue;
          vm.source = xmlDoc.getElementsByTagName("ContentItem")[0].getAttribute("source");
          vm.rating = xmlDoc.getElementsByTagName("rating")[0].childNodes[0].nodeValue;
          time = xmlDoc.getElementsByTagName("time")[0].childNodes[0].nodeValue;
          totalTime = xmlDoc.getElementsByTagName("time")[0].getAttribute("total");

          console.log(vm.rating);
          console.log(vm.track);

          if(vm.rating == 'UP'){
            vm.ratingClass = "fa-heart";
          }else{
            vm.ratingClass = "fa-heart-o";
          }

          noSettings.style.display = 'none';
          loaderInformations.style.display = 'none';
          main.style.display = 'block';

          //clearInterval(timer);
          //timer = setInterval(function() {Horloge();}, 1000);
          //getVolume();
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
    vm.progressBar = pourcent;
    vm.timeInfo = divTimeMessage;
  }
  //GO to Settings
  //settings_btn.addEventListener('click', function() {openSettingsPage();});
  settings_btn2.addEventListener('click', function() {openSettingsPage();});

  function openSettingsPage(){
    if (chrome.runtime.openOptionsPage) {
     chrome.runtime.openOptionsPage();
    } else {
     window.open(chrome.runtime.getURL('options/options.html'));
    }
  }

  function pushUpButton(button){
    if(button == "FAVORITE"){
      if(vm.rating == 'UP')
        button = "REMOVE_FAVORITE";
      else
        button = "ADD_FAVORITE";
    }
    var url = 'http://10.0.10.166:8090/key';
    xhr.open("POST", url, true);
    xhr.send('<?xml version="1.0" encoding="UTF-8" ?><key state="press" sender="Gabbo">'+button+'</key>');
    setTimeout(function() { getNowPlaying(); }, 500);
  }

  function pushDownButton(button){
    if(button == "FAVORITE"){
      if(vm.rating == 'UP')
        button = "REMOVE_FAVORITE";
      else
        button = "ADD_FAVORITE";
    }
    var url = 'http://10.0.10.166:8090/key';
    xhr.open("POST", url, true);
    xhr.send('<?xml version="1.0" encoding="UTF-8" ?><key state="release" sender="Gabbo">'+button+'</key>');
    setTimeout(function() { getNowPlaying(); }, 500);
  }

};
