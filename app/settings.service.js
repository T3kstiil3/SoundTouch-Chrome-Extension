angular
  .module('app')
  .service('settingsService',settingsService);

function settingsService() {
    var _this = this;
    this.data = [];
    this.getDevice = function(callback) {
        chrome.storage.sync.get('device', function(data) {
            _this.data = data;
            callback(_this.data);
        });
    }
    this.setDevice = function(data) {
        chrome.storage.sync.set({device: data}, function() {
            console.log('Data is stored in Chrome storage');
        });
    }
};
