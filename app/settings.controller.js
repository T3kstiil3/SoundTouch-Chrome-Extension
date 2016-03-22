angular
  .module('app')
  .controller('SettingsController',SettingsController);

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
    vm.currentDevice = device;
    vm.devices.splice(index,1);
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
    getLocalIPs(function(ips) {
        if(ips[0] && ValidateIPaddress(ips[0])){
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
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/){
      return (true);
    }
    return (false);
  }

  function getLocalIPs(callback) {
    var ips = [];
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = function(ice){  //listen for candidate events
        if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
        var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        ips.push(myIP);
        callback(ips);
        pc.onicecandidate = noop;
    };
  }
}
