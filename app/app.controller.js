angular
  .module('app', [])
  .config( [
      '$compileProvider','$logProvider',
      function( $compileProvider,$logProvider) {
          //Image src
          var currentImgSrcSanitizationWhitelist = $compileProvider.imgSrcSanitizationWhitelist();
          var newImgSrcSanitizationWhiteList = currentImgSrcSanitizationWhitelist.toString().slice(0,-1)
            + '|chrome-extension:'
            +currentImgSrcSanitizationWhitelist.toString().slice(-1);
          $compileProvider.imgSrcSanitizationWhitelist(newImgSrcSanitizationWhiteList);
      }
  ]);

angular
  .module('app')
  .controller('RemoteController', RemoteController);


/*ANALYTICS INTEGRATION*/
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-75287631-1']);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function RemoteController($scope,$http,settingsService) {

  var vm = this;
  vm.showSettings = false;
  vm.track = "";
  vm.album = "";
  vm.artist = "";
  vm.presets = [];

  vm.pushUpButton = pushUpButton;
  vm.pushDownButton = pushDownButton;
  vm.getNowPlaying = getNowPlaying;
  vm.openSettingsPage = openSettingsPage;
  vm.toggleSettings = toggleSettings;
  vm.toggleSources = toggleSources;
  vm.setVolume = setVolume;
  vm.openSettingIfnoDevice = openSettingIfnoDevice;

  var settings;
  var volume;
  var timer;
  var time = 0;
  var totalTime = 0;

  //ELEMENT
  var loaderSettings = document.getElementById("loaderSettings");
  var loaderInformations = document.getElementById("loaderInformations");
  var setSettingsMessage = document.getElementById("setSettingsMessage");
  var settings_btn = document.getElementById('settings_btn');
  var settings_btn2 = document.getElementById('settings_btn2');
  var loader = document.getElementById("loader");
  var main = document.getElementById("main");

  //Set default data to bind;
  defaultData();

  settingsService.getDevice(function(data){
    vm.device = data.device;
    if(vm.device){
      getNowPlaying();
      getSources();
      getPresets();
    }
  });

  function openSettingIfnoDevice(){
    if(!vm.device)
      toggleSettings();
  }

  function defaultData(){
    clearInterval(timer);
    vm.art = "img/img_loader.gif";
    vm.track = "No SoundTouch Selected";
    vm.artist = "Go to Settings ";
    vm.album = "";
    vm.ratingClass = "fa-heart-o";
    vm.playStatus = 'fa-play';
    vm.timeInfo = false;
    vm.progressBar = false;
  }


  //getSources
  //:8090/sources
  //TODO
  function getSources(){

    if(!vm.device){
      defaultData();
      return;
    }

    var url = 'http://'+vm.device.ipAddress+':8090/sources';
    $http.get(url, {}).then(function(response) {
      if (window.DOMParser)
      {
        parser = new DOMParser();
        var xmlDoc = parser.parseFromString(response.data,"text/xml");
        var sources = xmlDoc.getElementsByTagName("sourceItem");

        vm.sources = [];
        for (var i = 0; i < sources.length; i++) {
          var source = {};
          source.source = sources[i].getAttribute("source");
          source.status = sources[i].getAttribute("status");
          source.sourceAccount = sources[i].getAttribute("sourceAccount");
          source.isLocal = sources[i].getAttribute("isLocal");
          vm.sources.push(source);
        }
      }
    });
  }

  //getVolume
  //:8090/volume
  function getVolume(){

    if(!vm.device){
      defaultData();
      return;
    }

    var url = 'http://'+vm.device.ipAddress+':8090/volume';
    $http.get(url, {}).then(function(response) {
      if (window.DOMParser)
      {
        parser = new DOMParser();
        var xmlDoc = parser.parseFromString(response.data,"text/xml");
        volume = xmlDoc.getElementsByTagName("targetvolume")[0].childNodes[0].nodeValue;
        vm.volumeBar = volume;
      }
    });
  }

  function setVolume(event){
    console.log(event);
  }

  function getPresets(){
    //
    var url = 'http://'+vm.device.ipAddress+':8090/presets';
    $http.get(url, {}).then(function(response) {
      if (window.DOMParser){
        parser = new DOMParser();
        var xmlDoc = parser.parseFromString(response.data,"text/xml");
        for (var i = 0; i < xmlDoc.getElementsByTagName("preset").length; i++) {
          var preset = xmlDoc.getElementsByTagName("preset")[i];
          vm.presets.push({
            'id' : preset.getAttribute("id"),
            'source' : preset.childNodes[0].getAttribute("source"),
            'account' : preset.childNodes[0].getAttribute("sourceAccount"),
            'isPresetable' : preset.childNodes[0].getAttribute("isPresetable"),
            'type' : preset.childNodes[0].getAttribute("type"),
            'name': preset.getElementsByTagName("itemName")[0].childNodes[0].nodeValue
          });
        }
      }
    });
  }

  //Now Playing display
  function getNowPlaying(){

    settingsService.getDevice(function(data){
      vm.device = data.device;
    });

    if(!vm.device){
      defaultData();
      return;
    }

    var url = 'http://'+vm.device.ipAddress+':8090/now_playing';
    $http.get(url, {}).then(function(response) {
      if (window.DOMParser)
      {
        parser=new DOMParser();
        var xmlDoc = parser.parseFromString(response.data,"text/xml");
        if(xmlDoc.getElementsByTagName("track")[0]){

          vm.buttonStart = false;

          vm.source = xmlDoc.getElementsByTagName("ContentItem")[0].getAttribute("source");
          var playStatus = xmlDoc.getElementsByTagName("playStatus")[0].childNodes[0].nodeValue;

          if(playStatus == "PAUSE_STATE"){
            //ico play
            vm.playStatus = 'fa-play';
          }else if(playStatus == "PLAY_STATE"){
            //ico pause
            vm.playStatus = 'fa-pause';
          }

          if(vm.source == "BLUETOOTH"){
            vm.track = xmlDoc.getElementsByTagName("stationName")[0].childNodes[0].nodeValue;
            vm.art = "img/bluetooth_bg.jpg";
            vm.artist = "";
            vm.album = "";
          }else{
            vm.track = xmlDoc.getElementsByTagName("track")[0].childNodes[0].nodeValue;
            vm.artist  = xmlDoc.getElementsByTagName("artist")[0].childNodes[0].nodeValue;
            vm.album = xmlDoc.getElementsByTagName("album")[0].childNodes[0].nodeValue;
            vm.art = xmlDoc.getElementsByTagName("art")[0].childNodes[0].nodeValue;
            if(xmlDoc.getElementsByTagName("rating") && xmlDoc.getElementsByTagName("rating")[0])
              vm.rating = xmlDoc.getElementsByTagName("rating")[0].childNodes[0].nodeValue;
            vm.itemName = xmlDoc.getElementsByTagName("itemName")[0].childNodes[0].nodeValue;
            time = xmlDoc.getElementsByTagName("time")[0].childNodes[0].nodeValue;
            totalTime = xmlDoc.getElementsByTagName("time")[0].getAttribute("total");
          }

          if(vm.rating == 'UP'){
            vm.ratingClass = "fa-heart";
          }else{
            vm.ratingClass = "fa-heart-o";
          }

          getVolume();
          clearInterval(timer);
          if(vm.source != "BLUETOOTH"){
            timer = setInterval(function() {Horloge();}, 1000);
          }

        }else{
          if(xmlDoc.getElementsByTagName("ContentItem")[0].getAttribute("source") == 'STANDBY'){
            vm.track = "SoundTouch on Standby";
            vm.artist = "";
            vm.itemName = "No playlist selected"
            vm.buttonStart = true;
          }else if(xmlDoc.getElementsByTagName("ContentItem")[0].getAttribute("source") == 'INVALID_SOURCE'){
            vm.art = "img/img_loader.gif";
            vm.track = "No Music Source Selected";
            vm.artist = "Choice playlist !";
            vm.album = "";
            vm.ratingClass = "fa-heart-o";
            vm.playStatus = 'fa-play';
            vm.timeInfo = false;
            vm.progressBar = false;
          }
        }
      }
    });
  }

  //Horloge
  function Horloge() {
    if(vm.playStatus == "fa-pause"){
      time++;
    }
    if(time % 10 == 0){
      getNowPlaying();
    }
    var minutes = (time - Math.floor(time / 60) * 60); if(minutes < 10){minutes = "0"+minutes}
    var minutesTotal = (totalTime - Math.floor(totalTime / 60) * 60); if(minutesTotal < 10){minutesTotal = "0"+minutesTotal}
    var divTimeMessage = Math.floor(time / 60)+":"+minutes+" / "+Math.floor(totalTime / 60)+":"+minutesTotal;
    var pourcent = time/totalTime*100;
    //Get news informations
    if (time >= totalTime){
      clearInterval(timer);
      getNowPlaying();
    }
    $scope.$apply(function(){
      vm.progressBar = pourcent;
      vm.timeInfo = divTimeMessage;
    });
  }
  //GO to Settings
  //settings_btn.addEventListener('click', function() {openSettingsPage();});
  //settings_btn2.addEventListener('click', function() {openSettingsPage();});

  function openSettingsPage(){
    if (chrome.runtime.openOptionsPage) {
     chrome.runtime.openOptionsPage();
    } else {
     window.open(chrome.runtime.getURL('options/options.html'));
    }
  }

  function pushUpButton(button){
    if(!vm.device)
      return;

    if(button == "FAVORITE"){
      if(vm.rating == 'UP')
        button = "REMOVE_FAVORITE";
      else
        button = "ADD_FAVORITE";
    }
    var url = 'http://'+vm.device.ipAddress+':8090/key';
    var data = '<?xml version="1.0" encoding="UTF-8" ?><key state="release" sender="Gabbo">'+button+'</key>';
    $http({
        method: 'POST',
        url: url,
        data: data,
        headers: { "Content-Type": 'application/xml' }
    }).then(function(){
      getVolume();
      setTimeout(function() { getNowPlaying(); }, 500);
      if(button == "STANDBY") setTimeout(function() { pushDownButton('PLAY'); }, 2500);
      //Analytics send pushed button
      _gaq.push(['_trackEvent', button, 'clicked']);
    });
  }

  function pushDownButton(button){
    if(!vm.device)
      return;

    if(button == "FAVORITE"){
      if(vm.rating == 'UP')
        button = "REMOVE_FAVORITE";
      else
        button = "ADD_FAVORITE";
    }
    var url = 'http://'+vm.device.ipAddress+':8090/key';
    var data = '<?xml version="1.0" encoding="UTF-8" ?><key state="press" sender="Gabbo">'+button+'</key>';
    $http({
        method: 'POST',
        url: url,
        data: data,
        headers: { "Content-Type": 'application/xml' }
    }).then(function(){
      getVolume();
      setTimeout(function() { getNowPlaying(); }, 500);
      if(button == "STANDBY") setTimeout(function() { pushDownButton('PLAY'); }, 2500);
      //Analytics send pushed button
      _gaq.push(['_trackEvent', button, 'clicked']);
    });
  }

  function toggleSettings(){
    vm.showSettings = !vm.showSettings;
    settingsService.getDevice(function(data){
      vm.device = data.device;
      getNowPlaying();
    });
  }

  function toggleSources(){

    if(!vm.device)
      return;

    if(vm.showSources == "showSources"){
      vm.showSources = "";
    }else{
      vm.showSources = "showSources";
    }
  }
}
