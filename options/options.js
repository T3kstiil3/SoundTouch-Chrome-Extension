function save_options() {
  var ip = document.getElementById('ip').value;
  chrome.storage.sync.set({
    ip: ip
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    ip: '...'
  }, function(items) {
    document.getElementById('ip').value = items.ip;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);
