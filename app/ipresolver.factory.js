(function() {
  'use strict';

  angular.module('app')
    .factory('IPResolverService', IPResolverService);

  IPResolverService.$inject = ['$q'];

  function IPResolverService($q) {
    var deferred = $q.defer();
    //get the IP addresses associated with an account
    function getIPs(){
      var ip_dups = {};

      //compatibility for firefox and chrome
      var RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;
      var useWebKit = !!window.webkitRTCPeerConnection;

      //bypass naive webrtc blocking using an iframe
      if(!RTCPeerConnection){
        //NOTE: you need to have an iframe in the page right above the script tag
        //
        //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
        //<script>...getIPs called in here...
        //
        var win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection
        || win.mozRTCPeerConnection
        || win.webkitRTCPeerConnection;
        useWebKit = !!win.webkitRTCPeerConnection;
      }

      //minimal requirements for data connection
      var mediaConstraints = {
        optional: [{RtpDataChannels: true}]
      };

      //firefox already has a default stun server in about:config
      //    media.peerconnection.default_iceservers =
      //    [{"url": "stun:stun.services.mozilla.com"}]
      var servers = undefined;

      //add same stun server for chrome
      if(useWebKit)
        servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

      //construct a new RTCPeerConnection
      var pc = new RTCPeerConnection(servers, mediaConstraints);

      function handleCandidate(candidate){
        //match just the IP address
        var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
        var ip_addrs = ip_regex.exec(candidate);
        if (ip_addrs && typeof ip_addrs[0] !== 'undefined') {
          var ip_addr = ip_regex.exec(candidate)[1];

          ip_dups[ip_addr] = true;
        }
      }

      //listen for candidate events
      pc.onicecandidate = function(ice){

        //skip non-candidate events
        if(ice.candidate)
          handleCandidate(ice.candidate.candidate);
      };

      //create a bogus data channel
      pc.createDataChannel("");

      //create an offer sdp
      pc.createOffer(function(result){

        //trigger the stun server request
        pc.setLocalDescription(result, function(){}, function(){});

      }, function(){});

      //wait for a while to let everything done
      setTimeout(function(){
        //read candidate info from local description
        //raddr 192.168.0.102 rport
        var ip_regex = /raddr ([0-9]{1,3}(\.[0-9]{1,3}){3}) rport/;
        var ips = ip_regex.exec(pc.localDescription.sdp);
        if (ips && ips.length > 2) {
          deferred.resolve(ips[1]);
        } else {
          deferred.reject();
        }

      }, 1000);
      return deferred.promise;
    }

    return {
      resolve: function() {
        return getIPs();
      }
    }
  }
})();
