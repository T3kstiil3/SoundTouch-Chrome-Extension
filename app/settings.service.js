angular
  .module('app')
  .service('settingsService',settingsService);

function settingsService() {
    var _this = this;

    this.data = [];
    this.getDevice = function(callback) {
      if(typeof chrome !== 'undefined' && chrome && chrome.storage){
        chrome.storage.sync.get('device', function(data) { 
            _this.data = data;
            callback(_this.data);
        });
      }else if (localStorage) {
        if(localStorage.getItem('device'))
          callback(JSON.parse(localStorage.getItem('device')));
      }
    }
    this.setDevice = function(data) {
      if(typeof chrome !== 'undefined' && chrome && chrome.storage){
        chrome.storage.sync.set({device: data}, function() {
          console.log('Data is stored in Chrome storage');
        });
      }else if (localStorage) {
        localStorage.setItem('device', JSON.stringify({device: data}));
        console.log('Data is stored in local storage');
      }
    }
};
