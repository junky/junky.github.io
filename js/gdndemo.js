window.addEventListener('load', runTranslationsUpdates, false);

function runTranslationsUpdates() {
	calculateNumbers();
	getTranslations();
}

function calculateNumbers() {
	var slTags = document.getElementsByTagName("smartling:edit");
    var total = 0;
    var translated = 0;
	for (const tag of slTags) {
		if (tag.getAttribute("translation_workflow") != "60") {
			total++;
			if (tag.getAttribute("machine_translation") != null) {
				translated++;		
			}
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
     
	  	var slAjaxTags = ajaxDoc.querySelectorAll('[hash="'+hash+'"]');

	  	if(slAjaxTags!=null && slAjaxTags.length > 0) {
	  		tag.setAttribute("machine_translation", slAjaxTags[0].getAttribute("machine_translation"));
	  		tag.setAttribute("translation", slAjaxTags[0].getAttribute("translation"));
	  		tag.innerText = slAjaxTags[0].innerText;
	  	}
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

	xhttp.open("GET", window.location.href, true);
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
