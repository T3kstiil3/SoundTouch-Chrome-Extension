var xhr = new XMLHttpRequest();
xhr.open("GET", "http://10.0.10.166:8090/now_playing", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    var resp = JSON.parse(xhr.responseText);
    document.getElementById("text").innerText = resp;
  }
}
xhr.send();

document.getElementById("title").innerText = "Test de Titre";

document.querySelector('#go-to-options').addEventListener(function() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options/options.html'));
  }
});
