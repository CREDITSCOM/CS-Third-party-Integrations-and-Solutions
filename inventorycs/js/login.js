$(document).ready(function() {
  // Setup the dnd listeners on page load.
  let dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);
  document.getElementById('files').addEventListener('change', manualFileSelect, false);
});

$(document).on('click', '#login', function(event){ // Process login attempt.
  $('#error').empty();
  $('#error').removeClass();
  $('input[type="text"]').css({"border" : "", "box-shadow" : ""});
  let pubkey = $("#puk").val();
  let prikey = $("#prk").val();
  let cont = true;

  if(pubkey == '') { // PublicKey is empty
    $('#puk').css("border","2px solid red");
    $('#puk').css("box-shadow","0 0 3px red");
    $('#error').append("Please enter public key!<br />");
    cont = false;
  }

  if(prikey == '') { // PrivateKey is empty
    $('#prk').css("border","2px solid red");
    $('#prk').css("box-shadow","0 0 3px red");
    $('#error').append("Please enter private key!<br />");
    cont = false;
  }

  if(pubkey.length < 43 || pubkey.length > 45) { // Check length of PublicKey
    $('#puk').css("border","2px solid red");
    $('#puk').css("box-shadow","0 0 3px red");
    $('#error').append("Public key incorrect format.<br />");
    cont = false;
  }

  if(prikey.length < 87 || prikey.length > 89) { // Check length of PrivateKey
    $('#prk').css("border","2px solid red");
    $('#prk').css("box-shadow","0 0 3px red");
    $('#error').append("Private key incorrect format.<br />");
    cont = false;
  }

  if(!cont) { // Show error if one of the checks failed.
    $('#error').addClass("alert alert-danger");
  }

  if(cont) { // Proceed when there are no errors.
    sessionStorage.setItem('PublicKey', pubkey);
    sessionStorage.setItem('PrivateKey', prikey);
    sessionStorage.setItem('ip', $("#ip").val());
    sessionStorage.setItem('port', $("#port").val());
    window.location.href = 'inventory.html';
  }

});

function sessionExist() { // If session already exist, show keys in login form.
	let pubkey = sessionStorage.getItem('PublicKey');
	let prikey = sessionStorage.getItem('PrivateKey');

	if(pubkey != '' && prikey != '') {
		document.getElementById("puk").value = pubkey;
		document.getElementById("prk").value = prikey;
	}
}

function DownloadFile(filename, text) { // Download keyfile upon generating a new keypair.
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
}

function NewKey() { // Generate a new keypair.
	let signPair = nacl.sign.keyPair();
  let PublicKey = Base58.encode(signPair.publicKey);
  let PrivateKey = Base58.encode(signPair.secretKey);

  let str = {
    		key: {
          public: PublicKey,
          private: PrivateKey
        }
  };

	fileName = 'InventoryCS ' + new Date() + '.json';
  DownloadFile(fileName, JSON.stringify(str));

	document.getElementById("puk").value = PublicKey;
	document.getElementById("prk").value = PrivateKey;

	document.getElementById("login").click();
}

function handleFileSelect(evt) { // Read keyfile when dragged into drop zone.
  evt.stopPropagation();
  evt.preventDefault();
  document.getElementById("drop_zone").value = 'Processing key...';

  let files = evt.dataTransfer.files; // FileList object.

  // files is a FileList of File objects. List some properties.
  let output = [];
  f = files[0];
  let reader = new FileReader();
  reader.onload = function (e) {

      let FileContent = e.target.result;
      let Obj;

      try {
          Obj = JSON.parse(FileContent);
      } catch (e) {
          document.getElementById("error").innerText = 'No keys found';
          document.getElementById("drop_zone").innerText = 'Drop keyfile here';
          return;
      }

      if (Obj.key.public === undefined || Obj.key.private === undefined) {
          document.getElementById("error").innerText = 'No keys found';
          document.getElementById("drop_zone").innerText = 'Drop keyfile here';
          return;
      }

      document.getElementById("puk").value = Obj.key.public;
      document.getElementById("prk").value = Obj.key.private;


      document.getElementById("login").click();
  };
  reader.readAsText(f);
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function manualFileSelect(evt) { // Manual selection of keyfile
  let files = evt.target.files; // FileList object

  // files is a FileList of File objects. List some properties.
  let output = [];
  f = files[0];
  let reader = new FileReader();
  reader.onload = function (e) {

      let FileContent = e.target.result;
      let Obj;

      try {
          Obj = JSON.parse(FileContent);
      } catch (e) {
          document.getElementById("error").innerText = 'No keys found';
          return;
      }

      if (Obj.key.public === undefined || Obj.key.private === undefined) {
          document.getElementById("error").innerText = 'No keys found';
          return;
      }

      document.getElementById("puk").value = Obj.key.public;
      document.getElementById("prk").value = Obj.key.private;


      document.getElementById("login").click();
  };
  reader.readAsText(f);

}
