/*$( document ).ready(function() {
  $.ajax({
      type: "GET",
      url: "http://10.0.10.166:8090/now_playing",
      dataType: "xml",
      success: function (xml) {
          console.log(xml);
          //result = xml.city;
          //$("#title").html(result);
      },
      error: function (xml) {
          alert(xml.status + ' ' + xml.statusText);
      }
  });
});*/

document.querySelector('#go-to-options').addEventListener(function() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options/options.html'));
  }
});
