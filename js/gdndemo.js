window.onload = runTranslationsUpdates;

function runTranslationsUpdates() {
  calculateNumbers();
  getTranslations();
}

function calculateNumbers() {
	var slTags = document.getElementsByTagName("smartling:edit");
        var total = 0;
        var translated = 0;
	for (const tag of slTags) {
           total++;
           if (tag.getAttribute("machine_translation") != null) {
		translated++;		
           }
        }

	document.getElementById("total").innerHTML = total;
	document.getElementById("translated").innerHTML = translated;
}

function getHashcodes(ajaxDoc) {
	var slTags = document.getElementsByTagName("smartling:edit");
	for (const tag of slTags){
          var hash = tag.getAttribute("hash");
	  console.log("Updating tag " + hash);
     
          var slTags = ajaxDoc.querySelectorAll('[hash="'+hash+'"]');

	  tag.setAttribute("machine_translation", slTags[0].getAttribute("machine_translation"));
	  tag.setAttribute("translation", slTags[0].getAttribute("translation"));
	  tag.innerText = slTags[0].innerText;
	}
}

function getTranslations() {
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
	     var doc = new DOMParser().parseFromString(this.responseText, "text/html");
	     getHashcodes(doc);
             calculateNumbers();
       }
     };

   xhttp.open("GET", "https://ru-f742c2e48658bcfa6.getsmartling.com/?smartling_EditMode=1", true);
   xhttp.send();
}

window.onscroll = function() {onScrollFunc()};
addSLHeader();

function addSLHeader() {
  var elemDiv = document.createElement('div');
  elemDiv.setAttribute('id', 'gdnDemoHeader');
  elemDiv.innerHTML = '<h2>Smartling GDN Demo. Machine translation: <span id="translated">0</span>/<span id="total">0</span> strings.</h2>';
  elemDiv.style.cssText = 'padding:6px 12px;background:#56189e;color: #f1f1f1;';
  document.body.insertAdjacentElement("afterbegin", elemDiv);
}

var header = document.getElementById("gdnDemoHeader");

function onScrollFunc() {
  if (window.pageYOffset > header.offsetTop) {
    header.style.position = "fixed";
    header.style.top = "0";
    header.style.width = "100%";
  } else {
    header.style.position = "";
    header.style.top = "";
    header.style.width = "";
  }
}
