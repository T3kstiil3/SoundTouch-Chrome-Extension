angular
  .module('app')
  .controller('SettingsController',SettingsController);

function SettingsController($http,$q,settingsService,IPResolverService){
  //http://10.0.10.166:8090/info

  var vm = this;
  vm.scanProgress = false;
  //Function
  vm.scanNetwork = scanNetwork;
  vm.selectDevice = selectDevice;
  vm.reset = reset;

  var ips = [];
  var promises = [];
  var manifest = chrome.runtime.getManifest();
  if(manifest) vm.version = manifest.version;

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

  vm.testIpAdresse = function(el) {
    return $http.get("http://"+el+":8090/info", {});
  };

  function scanNetwork(){
    //Analytics send pushed button
    _gaq.push(['_trackEvent', "Scan Network Button", 'clicked']);
    vm.devices = [];
    vm.scanProgress = true;
    vm.noDevice = false;
    IPResolverService.resolve().then(function(ip) {
      if(ip && ValidateIPaddress(ip)){
        ip = ip.split(".");
        for (var i = 0; i < 254; i++) {
          var testIp = ip[0]+"."+ip[1]+"."+ip[2]+"."+i;
          ips.push(testIp);
        }
        var promises = [];
        angular.forEach(ips, function(ip) {
            promises.push(vm.testIpAdresse(ip));
        });
        $q.all(promises).then(function(responses){
          console.log(responses);
          /*angular.forEach(responses,function(response){
                if(response.status!="rejected"){
                     $scope.commentAuthors.push(reponse.value);
                }else{
                     console.log(response.reason);
                }
          });*/
        });
        /*
        angular.forEach(ips, function(testIp){
          console.log(testIp);
          $http.get("http://"+testIp+":8090/info", {}).then(function successCallback(response) {
            console.log(response);
            if(response.status == 200){
              console.log("on passe la !");
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
        });
        if(vm.devices.length == 0){
          vm.scanProgress = false;
          vm.noDevice = true;
        }*/
      }
    }).catch(function() {
      console.log('Error');
    });

  }

  function ValidateIPaddress(ipaddress){
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)){
      return (true);
    }
    return (false);
  }

}
