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
          console.log("Changing imgSrcSanitizationWhiteList from "+currentImgSrcSanitizationWhitelist+" to "+newImgSrcSanitizationWhiteList);
          $compileProvider.imgSrcSanitizationWhitelist(newImgSrcSanitizationWhiteList);
      }
  ]);

angular
  .module('app')
  .controller('SettingsController',SettingsController)
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

  vm.pushUpButton = pushUpButton;
  vm.pushDownButton = pushDownButton;
  vm.getNowPlaying = getNowPlaying;
  vm.openSettingsPage = openSettingsPage;
  vm.toggleSettings = toggleSettings;

  //https://dribbble.com/shots/2282786-Bop-Web-Player/attachments/431768

  var xhr = new XMLHttpRequest();
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


  settingsService.getDevice(function(data){
    vm.device = data.device;
    console.log(vm.device);
    if(vm.device){
      getNowPlaying();
    }else{
      toggleSettings();
    }
  });

  //getSources
  //:8090/sources

  //getVolume
  //:8090/volume
  function getVolume(){
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

  //Now Playing display
  function getNowPlaying(){

    if(!vm.device)
      return;

    var url = 'http://'+vm.device.ipAddress+':8090/now_playing';
    $http.get(url, {}).then(function(response) {
      if (window.DOMParser)
      {
        parser=new DOMParser();
        var xmlDoc = parser.parseFromString(response.data,"text/xml");
        if(xmlDoc.getElementsByTagName("track")[0]){

          vm.source = xmlDoc.getElementsByTagName("ContentItem")[0].getAttribute("source");

          if(vm.source == "BLUETOOTH"){
            vm.track = xmlDoc.getElementsByTagName("stationName")[0].childNodes[0].nodeValue;
            vm.art = "img/bluetooth_bg.jpg";
          }else{
            vm.track = xmlDoc.getElementsByTagName("track")[0].childNodes[0].nodeValue;
            vm.artist  = xmlDoc.getElementsByTagName("artist")[0].childNodes[0].nodeValue;
            vm.album = xmlDoc.getElementsByTagName("album")[0].childNodes[0].nodeValue;
            vm.art = xmlDoc.getElementsByTagName("art")[0].childNodes[0].nodeValue;
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

        }
      }
    });
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
    if(button == "FAVORITE"){
      if(vm.rating == 'UP')
        button = "REMOVE_FAVORITE";
      else
        button = "ADD_FAVORITE";
    }
    var url = 'http://'+vm.device.ipAddress+':8090/key';
    xhr.open("POST", url, true);
    xhr.send('<?xml version="1.0" encoding="UTF-8" ?><key state="release" sender="Gabbo">'+button+'</key>');
    getVolume();
    setTimeout(function() { getNowPlaying(); }, 500);
  }

  function pushDownButton(button){
    if(button == "FAVORITE"){
      if(vm.rating == 'UP')
        button = "REMOVE_FAVORITE";
      else
        button = "ADD_FAVORITE";
    }
    var url = 'http://'+vm.device.ipAddress+':8090/key';
    xhr.open("POST", url, true);
    xhr.send('<?xml version="1.0" encoding="UTF-8" ?><key state="press" sender="Gabbo">'+button+'</key>');
    getVolume();
    setTimeout(function() { getNowPlaying(); }, 500);
    //Analytics send pushed button
    _gaq.push(['_trackEvent', button, 'clicked']);
  }

  function toggleSettings(){
    vm.showSettings = !vm.showSettings;
    //Send order to SettingsController

  }
}

function SettingsController($http,settingsService){
  //http://10.0.10.166:8090/info

  var vm = this;
  vm.scanProgress = false;
  //Function
  vm.scanNetwork = scanNetwork;
  vm.selectDevice = selectDevice;
  vm.reset = reset;

  function reset(){
    settingsService.setDevice(null);
    vm.currentDevice = null;
  }
  function selectDevice(device,index){
    settingsService.setDevice(device);
  }

  settingsService.getDevice(function(data){
    vm.currentDevice = data.device;
  });

  function scanNetwork(){
    //Analytics send pushed button
    _gaq.push(['_trackEvent', "Scan Network Button", 'clicked']);
    vm.devices = [];
    vm.scanProgress = true;
    vm.noDevice = false;
    getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
        if(ips[1] && ValidateIPaddress(ips[1])){
          var ip = ips[1];
          ip = ip.split(".");
          for (var i = 0; i < 254; i++) {
            var testIp = ip[0]+"."+ip[1]+"."+ip[2]+"."+i;
            $http.get("http://"+testIp+":8090/info", {}).then(function successCallback(response) {
              if(response.status == 200 && response.data.indexOf('deviceID') > -1 ){
                parser=new DOMParser();
                var xmlDoc = parser.parseFromString(response.data,"text/xml");
                var device = {};
                device.name = xmlDoc.getElementsByTagName("name")[0].childNodes[0].nodeValue;
                device.type = xmlDoc.getElementsByTagName("type")[0].childNodes[0].nodeValue;
                device.ipAddress = xmlDoc.getElementsByTagName("ipAddress")[0].childNodes[0].nodeValue;
                vm.devices.push(device);
                vm.scanProgress = false;
                vm.noDevice = false;
              }
            }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
          }
          if(vm.devices.length == 0){
            vm.scanProgress = false;
            vm.noDevice = true;
          }
        }
    });
  }

  function ValidateIPaddress(ipaddress)
  {
   if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)
    {
      return (true)
    }
    return (false)
  }

  function getLocalIPs(callback) {
    var ips = [];

    var RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var pc = new RTCPeerConnection({
        // Don't specify any stun/turn servers, otherwise you will
        // also find your public IP addresses.
        iceServers: []
    });
    // Add a media line, this is needed to activate candidate gathering.
    pc.createDataChannel('');

    // onicecandidate is triggered whenever a candidate has been found.
    pc.onicecandidate = function(e) {
        if (!e.candidate) { // Candidate gathering completed.
            pc.close();
            callback(ips);
            return;
        }
        var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
        if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
            ips.push(ip);
    };
    pc.createOffer(function(sdp) {
        pc.setLocalDescription(sdp);
    }, function onerror() {});
  }
}
