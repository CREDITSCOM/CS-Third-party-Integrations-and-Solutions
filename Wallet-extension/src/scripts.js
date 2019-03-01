let nodeIP;
let nodePORT;
let keyPublic;
let keyPrivate;
let keySize = 256;
let ivSize = 128;
let iterations = 100;
let returnmessage;
let monitorUrl = 'https://monitor.credits.com/testnet-r4/';


$(document).ready(function(){ // Function gets executed on page load.

	$('[data-toggle="popover"]').popover({html: true, trigger: "hover"}); // Initiate bootstrap popover

	chrome.storage.local.get(function(result) { // Get node and keys from local storage
		 nodeIP = result.ip;
		 nodePORT = result.port;
		 keyPublic = result.PublicKey;
		 keyPrivate = result.PrivateKey;

			 if(result.PrivateKey == null || (keyPrivate.length < 87 || keyPrivate.length > 89)) { // If there is no key or key is incorrect length, forward to login form
					 $('#extensionlogin').show();
				 } else {
					 if(result.PrivateKey.length == 152) {
						 $('#extensionlogin').show();
					 } else {
					 	loadTxscreen(result.PublicKey, 0); // Load tx screen
				 	}
				 }

	 });


				// Setup the dnd listeners on page load.
				let dropZone = document.getElementById('drop_zone');
				dropZone.addEventListener('dragover', handleDragOver, false);
				dropZone.addEventListener('drop', handleFileSelect, false);
				document.getElementById('files').addEventListener('change', manualFileSelect, false);

});

$(document).on('click', '#logout', function(event){ // On logging out reset storage
	chrome.storage.local.clear(function() {
	    var error = chrome.runtime.lastError;
	    if (error) {
	        console.error(error);
	    }
		});

		document.getElementById("puk").value = '';
		document.getElementById("prk").value = '';

		$('#openwallet').hide();
		$('#newwallet').hide();
		$('#extensionindex').hide();
		$('#logoutbutton').hide();
		$('#extensionlogin').show();
});

$(document).on('click', '#login', function(event){ // Process login attempt.
  $('#error').empty();
  $('#error').removeClass();
  $('input[type="text"]').css({"border" : "", "box-shadow" : ""});
  let pubkey = $("#puk").val();
  let prikey = $("#prk").val();
	let ip = $('#ip').val();
	let port = $('#port').val();
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

  if((pubkey.length < 43 || pubkey.length > 45) && pubkey.length != 128) { // Check length of PublicKey
    $('#puk').css("border","2px solid red");
    $('#puk').css("box-shadow","0 0 3px red");
    $('#error').append("Public key incorrect format.<br />");
    cont = false;
  }

  if((prikey.length < 87 || prikey.length > 89) && prikey.length != 192) { // Check length of PrivateKey
    $('#prk').css("border","2px solid red");
    $('#prk').css("box-shadow","0 0 3px red");
    $('#error').append("Private key incorrect format.<br />");
    cont = false;
  }

  if(!cont) { // Show error if one of the checks failed.
    $('#error').addClass("alert alert-danger");
		$('#error').show();
  }

  if(cont) { // Proceed when there are no errors.
		if(prikey.length == 192) {
			chrome.storage.local.set({
	  		'PublicKey': pubkey,
	  		'PrivateKey': prikey,
	  		'ip': ip,
				'port': port
			});

			nodeIP = ip;
			nodePORT = port;
			keyPublic = pubkey;
			keyPrivate = prikey;

			$('#extensionlogin').hide();
			$('#openwallet').show();

		} else {
			chrome.storage.local.set({ // Setup storage
	  		'PublicKey': pubkey,
	  		'PrivateKey': prikey,
	  		'ip': ip,
				'port': port
			});

			nodeIP = ip;
			nodePORT = port;
			keyPublic = pubkey;
			keyPrivate = prikey;
			loadTxscreen(pubkey, 0);
		}
  }

});

function loadTxscreen(walletkey, m) {
	document.getElementById("tokey").value = '';
	document.getElementById("tosend").value = '';
	$('#confirmTX').hide();
	$('#initialTX').show();
	$('#extensionlogin').hide();
	$('#openwallet').hide();
	$('#extensionindex').show();
	$('#txhis').hide();
	$('#account').show();
	$('#logoutbutton').show();
	if(m == 0) {
		walletBalance(walletkey);
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

$(document).on('click', '#openwal', function(event){ // Open wallet function
	pass = $('#unlockpass').val();
	$('#unlockerror').empty();
	$('#unlockerror').removeClass();
	cont = true;

	if(pass == '') {
		$('#unlockerror').append("Please enter a password.<br />");
		cont = false;
	}

	if(/\s/.test(pass)) {
		$('#unlockerror').append("Password can not contain spaces.<br />");
		cont = false;
	}


	key1 = decrypt(keyPublic, pass);
	key2 = decrypt(keyPrivate, pass);

	if(key2 == '') {
		$('#unlockerror').append("Incorrect password.");
		cont = false;
	}

	if(!cont) {
		$('#unlockerror').addClass("alert alert-danger");
	}

	if(cont) {
		chrome.storage.local.set({
			'PublicKey': key1,
			'PrivateKey': key2
		});

		keyPublic = key1;
		keyPrivate = key2;
		loadTxscreen(keyPublic, 0);
	}

});

$(document).on('click', '#genkey', function(event){ // Upon generating new wallet, show screen for new wallet.
	$('#extensionlogin').hide();
	$('#newwallet').show();
});

$(document).on('click', '#generate', function(event){ // Setting up new wallet
	$('#generror').empty();
	$('#generror').removeClass();
	pass1 = $('#pass1').val();
	pass2 = $('#pass2').val();
	cont = true;

	if(pass1 == '' || pass2 == '') {
		$('#generror').append("Please enter a password.<br />");
		cont = false;
	}

	if(pass1 != pass2) {
		$('#generror').append("Passwords do not match.<br />");
		cont = false;
	}

	if(/\s/.test(pass1)) {
		$('#generror').append("Password can not contain spaces.<br />");
		cont = false;
	}

	if(pass1.length < 8) {
		$('#generror').append("Password is too short. Minimum 8 characters.<br />");
		cont = false;
	}


	if(!cont) {
		$('#generror').addClass("alert alert-danger");
	}

	if(cont) { // When no errors are found continue

		let signPair = nacl.sign.keyPair(); // Generate keys
	  let PublicKey = Base58.encode(signPair.publicKey); // public key
	 	let PrivateKey = Base58.encode(signPair.secretKey); // private key


			encrypPublic = encrypt(PublicKey, pass1); // Encrypt public key with password
			encrypPrivate = encrypt(PrivateKey, pass1); // Encrypt private key with password

	  let str = { // Create json object
	    		key: {
	          public: encrypPublic,
	          private: encrypPrivate
	        }
	  };

		fileName = 'WalletCS ' + new Date() + '.json';
	  DownloadFile(fileName, JSON.stringify(str)); // Download key as a .json file

		$('#error').html("<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a> Wallet succesfully created.");
		$('#error').addClass("alert alert-success alert-dismissible");
		showAlert();
		$('#newwallet').hide();
		$('#extensionlogin').show();
	}
});

function showAlert() { // Show result for a few seconds before message disappears.
        $("#error").fadeTo(3500, 600).slideUp(400, function () {
          $("#error").slideUp(600);
      });
}

function showTxAlert() { // Show result for a few seconds before message disappears.
			$('#balance').html('<img src="../img/loader.svg" width="20" height="20">');
        $("#txerror").fadeTo(3500, 600).slideUp(400, function () {
          $("#txerror").slideUp(600);
					walletBalance(keyPublic);
      });
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

$(document).on('click', '#refreshBalance', function(event){ // Refresh balances calls the walletbalance() function
	walletBalance(keyPublic);
});

$(document).on('click', '#openaccount', function(event){
	$('input[type="text"]').css({"border" : "", "box-shadow" : ""});
	$('#txerror').empty();
	$('#txerror').removeClass();
	$('#txhis').hide();
	$('#account').show();
	$('#balance').html('<img src="../img/loader.svg">');
	loadTxscreen(keyPublic, 0);
});

$(document).on('click', '#txhistory', function(event){
	$('input[type="text"]').css({"border" : "", "box-shadow" : ""});
	$('#account').hide();
	$('#tentx').hide();

	$('#txhis').show();

	$('#txamount').html('<img src="../img/loader.svg">');
	$('#showtx').empty();

	getTransactions(keyPublic);

});

$(document).on('click', '#exportkeyfile', function(event){ // Export raw keyfile without encrypted keys (not recommended, but possible in this version)

	let str = {
				key: {
					public: keyPublic,
					private: keyPrivate
				}
	};

	fileName = 'RawWalletCS ' + new Date() + '.json';
	DownloadFile(fileName, JSON.stringify(str));

});


function getTransactions(key) { // Get transaction history

			Connect().TransactionsGet(Base58.decode(key), 0, 10, function (r) {
				console.log(r);
				let showamount;
				if(r.total_trxns_count < 10) {
					showamount = r.total_trxns_count;
				} else {
					showamount = 10;
				}

				$('#txamount').text('Showing last '+ showamount +' transactions of ' + r.total_trxns_count);
				if(showamount > 0) {
					$('#showtxthead').html("<tr><td width='175'>Account</td><td width='50'>&nbsp;</td><td class='amount' align='center'>Amount</td><td>&nbsp;</td></tr>");
				}
				for(let index in r.transactions) {
					let from = Base58.encode(byte_array(r.transactions[index].trxn.source));
					let to = Base58.encode(byte_array(r.transactions[index].trxn.target));
					let decimals = (r.transactions[index].trxn.amount.fraction).toString();
					let fraction;

					if(decimals.length > 16) {
						fraction = String(r.transactions[index].trxn.amount.fraction / Math.pow(10, 18)).split(".")[1];
					} else {
						fraction = Number(r.transactions[index].trxn.amount.fraction / Math.pow(10,18)).toFixed(18).replace(/\.?0+$/,"").split(".")[1];
					}

				 if (fraction === undefined)
						 fraction = 0;

					let amount = r.transactions[index].trxn.amount.integral + "." + fraction;

					let url = monitorUrl + 'transaction/' + convertToHex(r.transactions[index].id.poolHash) + '.' + (r.transactions[index].id.index + 1);

					if(key == from) {
						account = to.substring(0, 16);
						$('#showtx').append("<tr><td width='175'>" + account + "...</td><td width='50'><span class=\"label label-warning\">OUT</span></td><td class='amount' align='center'>" + amount + " CS</td><td><a href=\"" + url + "\" target=\"_blank\"><i class=\"fas fa-external-link-alt\"></i></a></td></tr>");
					} else if(key == to){
						account = from.substring(0, 16);
						$('#showtx').append("<tr><td width='175'>" + account + "...</td><td width='50'><span class=\"label label-success\">IN</span></td><td class='amount' align='center'>" + amount + " CS</td><td><a href=\"" + url + "\" target=\"_blank\"><i class=\"fas fa-external-link-alt\"></i></a></td></tr>");
					}

				}
				$('#tentx').show();
			});

}

function convertToHex(str) { // Convert poolhash
    var hex = '';
    for(var i=0;i<str.length;i++) {
			digits = str.charCodeAt(i).toString(16).length;
			if(digits != '2') {
				add = '0'+str.charCodeAt(i).toString(16);
			} else {
				add = str.charCodeAt(i).toString(16);
			}
        hex += ''+add;
    }
    return hex;
}

function byte_array(s) { // Function to show contract addresses in a readable way.
    let arr = [];
    for (let i = 0; i < s.length; i++) {
        arr.push(s.charCodeAt(i));
    }
    return arr;
}

$(document).on('click', '#copy', function(event){ // Copy public key
		let $temp = $("<input>");
	  $("body").append($temp);
	  $temp.val(keyPublic).select();
	  document.execCommand("copy");
	  $temp.remove();
});

$(document).on('click', '#createTX', function(event){ // Create transaction

	$('input[type="text"]').css({"border" : "", "box-shadow" : ""});
	$('#txerror').empty();
	$('#txerror').removeClass();

	let regexp = /^\d+(\.\d{1,18})?$/;
	cont = true;

	to = $('#tokey').val();
	amount = $('#tosend').val();
	amount = amount.replace(/,/, '.');
	maxfee = $('#maxfee').val();

	if(amount.charAt(0) == '.') {
		amount = "0" + amount;
	}

	if(to == keyPublic) {
    $('#tokey').css("border","2px solid red");
    $('#tokey').css("box-shadow","0 0 3px red");
		$('#txerror').append('You can\'t send a transaction to yourself<br />');
		cont = false;
	}

	if(to == '' || to.length < 43 || to.length > 45) {
		$('#tokey').css("border","2px solid red");
    $('#tokey').css("box-shadow","0 0 3px red");
		$('#txerror').append('Please enter a valid public key<br />');
		cont = false;
	}

	if(amount == '') {
		$('#tosend').css("border","2px solid red");
    $('#tosend').css("box-shadow","0 0 3px red");
		$('#txerror').append('Please enter an amount<br />');
		cont = false;
	} else {
			if(regexp.test(amount) != true) {
				$('#tosend').css("border","2px solid red");
		    $('#tosend').css("box-shadow","0 0 3px red");
				$('#txerror').append('Please enter a valid amount<br />');
				cont = false;
			}
		}

	if(maxfee == '') {
		$('#txerror').append('Please enter the maximum fee<br />');
		cont = false;
	}

	if(!cont) { // Show error if one of the checks failed.
    $('#txerror').addClass("alert alert-danger");
		$('#txerror').show();
  }


	if(cont) {
		$('#initialTX').hide();
		$('#confirmTX').show();
		$('#transactionto').text(to);
		$('#tosendto').text(amount);
		$('#tosend').text(amount);
		$('#maxfeeto').text(maxfee);
	}

});

$(document).on('click', '#sendTX', function(event){ // Send transaction

	$('#txerror').empty();
	$('#txerror').removeClass();

	let to = $('#tokey').val();
	let amount = $('#tosend').val();
	let maxfee = $('#maxfeeto').val();


	if(!cont) { // Show error if one of the checks failed.
    $('#txerror').addClass("alert alert-danger");
		$('#txerror').show();
  }


	let id = txid(Connect(), Base58.decode(keyPublic)); // Transaction ID is the amount of transactions from the public key +1 (new transaction)
	id = id + 1;

	var Trans = SignCS.ConstructTransaction(SignCS.Connect(), {
				amount: amount,
				currency: 1,
				fee: 1.0,
				source: keyPublic,
				Priv: keyPrivate,
				target: to,
		});


	SignCS.Connect().TransactionFlow(Trans, function (res) {

	if ("Success" === res.status.message.split(" ")[0]) {
		$('#txerror').html("<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a> Transaction sent to the node.");
		$('#txerror').addClass("alert alert-success alert-dismissible");
		showTxAlert();
		loadTxscreen(keyPublic, 1);
	} else {
		$('#txerror').text("Something went wrong.");
		$('#txerror').addClass("alert alert-danger");
		$('#txerror').show();
		loadTxscreen(keyPublic, 0);
	}
	});

});

$(document).on('click', '#resetTX', function(event){
loadTxscreen(keyPublic, 0);
});

function txid(ApiConnect, key) { // Request amount of wallet transactions
  let TransId = Connect().WalletTransactionsCountGet(key);
    if (TransId.status.message === "Success") {
      return TransId.lastTransactionInnerId;
    } else {
      return 0;
    }
}

function walletBalance(key) { // Function to show balance of public key.
$('#balance').html('<img src="../img/loader.svg" width="20" height="20">');
			Connect().WalletBalanceGet(Base58.decode(key), function (r) {
				 	let fraction = String(r.balance.fraction / Math.pow(10, 18)).split(".")[1];

			    if (fraction === undefined)
			        fraction = 0;

			    $('#balance').html(key + "<br />Balance: " + r.balance.integral + "." + fraction + " CS <img src=\"../img/refresh.png\" id=\"refreshBalance\" alt=\"Refresh Balance\" style=\"width:16px;height:16px\">");

		});
}

function Connect() { // Connect to node via apache thrift
		let transport;
		try {
			transport = new Thrift.Transport("http://" + nodeIP + ":" + nodePORT + "/thrift/service/Api/");
		} catch(e) {
			console.log(e);
		}
	  let protocol = new Thrift.Protocol(transport);
	  return new APIClient(protocol);
}

function encrypt (msg, pass) {
	var salt = CryptoJS.lib.WordArray.random(128/8);

	var key = CryptoJS.PBKDF2(pass, salt, {
			keySize: keySize/32,
			iterations: iterations
		});

	var iv = CryptoJS.lib.WordArray.random(128/8);

	var encrypted = CryptoJS.AES.encrypt(msg, key, {
		iv: iv,
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC

	});

	// salt, iv will be hex 32 in length
	// append them to the ciphertext for use  in decryption
	var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
	return transitmessage;
}

function decrypt (transitmessage, pass) {
	var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
	var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
	var encrypted = transitmessage.substring(64);

	var key = CryptoJS.PBKDF2(pass, salt, {
			keySize: keySize/32,
			iterations: iterations
		});


	var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
		iv: iv,
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC

	})
	try {
		decrypted = decrypted.toString(CryptoJS.enc.Utf8);
	} catch (e) {
		decrypted = '';
	}

return decrypted;
}
