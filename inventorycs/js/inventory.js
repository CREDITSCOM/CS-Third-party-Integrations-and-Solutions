let returnmessage;

$(document).ready(function() { // On page load hide areas that are not needed at that point.
   $('#errorarea').hide();
   $('#add_button').hide();
   $('#product_datalist').hide();
   $('#loading').hide();
   $('#change').hide();
   $('#showchanges').hide();

    $('[data-toggle="popover"]').popover({html: true, trigger: "hover"});
});

function checkLogin() { // Check if sessionstorage already contains a public and private key. If not, redirect to index.html
  let pubkey = sessionStorage.getItem('PublicKey');
  let prikey = sessionStorage.getItem('PrivateKey');

    if(pubkey == null || prikey == null) {
      window.location.href = 'index.html';
    }
    walletBalance();
    showContracts();
    $('#balancehelp').attr("data-content", "This is the balance of public key<br>" + pubkey + "<br>We recommend to have at least 0.1 CS to be able to work with the blockchain.");
}

function DeployContract() { // This function deploy the smart contract to the Credits blockchain.
  $('#contracts').html('Creating new inventory address... <br /><img src="img/loader.svg">');
  $('#createnew').hide();
    let contract = `import com.google.gson.Gson;
import java.util.Random;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Arrays;

public class Contract extends SmartContract {

 private String deployer;
 HashMap<Integer, List<Object>> stock;


 public Contract(String initiator) {
 super(initiator);
 deployer = "${sessionStorage.getItem('PublicKey')}";
 stock = new HashMap<>();
 }

 public boolean checkValidity() {
   return true;
 }

 public String getDeployer() {
 return deployer;
 }

 public String addItem(int ean, String name, int quantity) {
   checkOwner(initiator);

   stock.put(ean, Arrays.asList(name, quantity));
   return exportData();
 }

 public String addItems(String eanm, String namem, String quantitym) {
      checkOwner(initiator);


   String eans[] = eanm.split(", ");
   String names[] = namem.split (", ");
   String quantities[] = quantitym.split (", ");

   for(int i = 0; i < eans.length; i ++) {

     int ean = Integer.parseInt(eans[i]);
     int quantity = Integer.parseInt(quantities[i]);
     String name = names[i];

       stock.put(ean, Arrays.asList(name, quantity));
   }

   return exportData();
 }

 public boolean deleteItem(int ean) {
   checkOwner(initiator);

   stock.remove(ean);
   return true;
 }

 public String getItem(int ean, int val) {
 checkOwner(initiator);

 List<Object> test = stock.get(ean);

 return String.valueOf(test.get(val));
 }

 public boolean importData(String jsondata) {
 checkOwner(initiator);

 return true;
 }


 public String exportData() {
 checkOwner(initiator);

 Gson gson = new Gson();
 String json = gson.toJson(stock);

 return json;

 }

 public boolean checkOwner(String sendfrom) {
 if(!sendfrom.equals(deployer)) {
 throw new RuntimeException("No access");
 }
 return true;
 }


}`;

  let id = txid(Connect(), Base58.decode(sessionStorage.getItem('PublicKey')));
  id = id + 1;

    let Trans = SignCS.ConstructTransaction(SignCS.Connect(), {
        id: id,
        amount: "0,0",
        currency: 1,
        fee: "100.0",
        source: sessionStorage.getItem('PublicKey'),
        Priv: sessionStorage.getItem('PrivateKey'),
        smart: {
            method: "",
            params: [],
            forgetNewState: false,
            code: contract
        }
    });

    if (Trans === null) {
        alert("Transaction failure");
        return;
    }

    SignCS.Connect().TransactionFlow(Trans, function (r) {
        if ("Success" === r.status.message.split(" ")[0]) {
          console.log(r);
          showContracts();
          $('#createnew').show();
        }
        else {
          alert("Failed");
        }
    });
}

function createTransaction(method, params, callback) { // Function to create a smart contract transaction.


  let id = txid(Connect(), Base58.decode(sessionStorage.getItem('PublicKey'))); // Transaction ID is the amount of transactions from the public key +1 (new transaction)
  id = id + 1;

  if(params == null) {
    params = [];
  } else {
    params = params;
  }

  let Trans = SignCS.ConstructTransaction(SignCS.Connect(), {
                  id: id,
                  amount: 0,
                  currency: 1,
                  fee: 1.0,
                  source: sessionStorage.getItem('PublicKey'),
                  Priv: sessionStorage.getItem('PrivateKey'),
                  target: sessionStorage.getItem('SmartContract'),
                  smart: {
                      method: method,
                      params: params,
                      forgetNewState: false
                  }
              });

          SignCS.Connect().TransactionFlow(Trans, function (res) { // Transaction result
              let mess = "message: " + res.status.message.split(" ")[0];
          if (res.smart_contract_result !== null) { // If transaction went through
            if (res.smart_contract_result.v_bool !== null) {
                mess += "\n\rbool: " + res.smart_contract_result.v_bool;
                returnmessage = res.smart_contract_result.v_bool;
            }
            if (res.smart_contract_result.v_double !== null) {
                mess += "\n\rdouble: " + res.smart_contract_result.v_double;
                returnmessage = res.smart_contract_result.v_double;
            }
            if (res.smart_contract_result.v_i8 !== null) {
                mess += "\n\ri8: " + res.smart_contract_result.v_i8;
                returnmessage = res.smart_contract_result.v_i8;
            }
            if (res.smart_contract_result.v_i16 !== null) {
                mess += "\n\ri16: " + res.smart_contract_result.v_i16;
                returnmessage = res.smart_contract_result.v_i16;
            }
            if (res.smart_contract_result.v_i32 !== null) {
                mess += "\n\ri32: " + res.smart_contract_result.v_i32;
                returnmessage = res.smart_contract_result.v_i32;
            }
            if (res.smart_contract_result.v_i64 !== null) {
                mess += "\n\ri64: " + res.smart_contract_result.v_i64;
                returnmessage = res.smart_contract_result.v_i64;
            }
            if (res.smart_contract_result.v_list !== null) {
                mess += "\n\rlist: " + res.smart_contract_result.v_list;
                returnmessage = res.smart_contract_result.v_list;
            }
            if (res.smart_contract_result.v_map !== null) {
                mess += "\n\rmap: " + res.smart_contract_result.v_map;
                returnmessage = res.smart_contract_result.v_map;
            }
            if (res.smart_contract_result.v_set !== null) {
                mess += "\n\rset: " + res.smart_contract_result.v_set;
                returnmessage = res.smart_contract_result.v_set;
            }
            if (res.smart_contract_result.v_string !== null) {
                mess += "\n\rstring: " + res.smart_contract_result.v_string;
                returnmessage = res.smart_contract_result.v_string;
            }
            if(typeof callback !== 'undefined'){
            callback(callback(returnmessage, 1, method));
            }
        } else { // Else if transaction failed return message
          returnmessage = res.status.message;
          callback(callback(returnmessage, 0, method));
        }

          });

}

function txid(ApiConnect, key) { // Request amount of wallet transactions
  let TransId = Connect().WalletTransactionsCountGet(key);
    if (TransId.status.message === "Success") {
      return TransId.lastTransactionInnerId;
    } else {
      return 0;
    }
}

function logOut(i) { // Clear sessions on logging out.
  if($('#number').text() != '0' && i == '0') { // Check if there is nothing in the changelist.
    $('#logoutModal').modal('show');
  } else {
    sessionStorage.clear();
    window.location.href = 'index.html';
  }
}

function Connect() { // Connect to node via apache thrift
  let ip = sessionStorage.getItem("ip");
  let port = sessionStorage.getItem("port");
  let transport = new Thrift.Transport("http://" + ip + ":" + port + "/thrift/service/Api/");
  let protocol = new Thrift.Protocol(transport);
  return new APIClient(protocol);
}

function byte_array(s) { // Function to show contract addresses in a readable way.
    let arr = [];
    for (let i = 0; i < s.length; i++) {
        arr.push(s.charCodeAt(i));
    }
    return arr;
}

function selectContract() { // Select contract to open up contract.
    $('#errorarea').hide();
  contract = $("#selectcontract").val();

  if(contract != '') {
    sessionStorage.setItem('SmartContract', $("#selectcontract").val());
    Connect().SmartContractDataGet(Base58.decode($("#selectcontract").val()), function (res) {
      cont = false;
      for(let index in res.methods) {
        if(res.methods[index].name == 'checkValidity') { // This function in the smart contract needs to be present. If not, contract is not valid for this dApp.
          cont = true;
        }
      }
      if(!cont) {
        $('#errorarea').html('<div class="alert alert-danger alert-dismissible" id="slidealert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Invalid smart contract!</div>').show();
      } else {
        fetchData();
        $('#product_datalist').hide();
        $('#contractselect').hide();
        $('#loading').html('<img src="img/loader.svg">').show();
      }
    });
  }
}

function changeContract() { // Upon chaning contract, reload inventory.html page
sessionStorage.removeItem('SmartContract');
window.location.href = 'inventory.html';
}


function showContracts() { // Show contracts found deployed with the public key that was used for logging in.
Connect().SmartContractsListGet(Base58.decode(sessionStorage.getItem('PublicKey')), function (res) {
  if (res.count > 0) {
    let select = $("<select></select>").attr("id", "selectcontract").attr("onchange", "selectContract();");
    select.append($("<option></option>").attr("value", "").text("Select smart contract"));
      for (let index in res.smartContractsList) {
        Connect().SmartContractDataGet(Base58.decode(Base58.encode(byte_array(res.smartContractsList[index].address))), function (conres) {
          cont = false;
          for(let indexcontract in conres.methods) {
            if(conres.methods[indexcontract].name == 'checkValidity') { // This function in the smart contract needs to be present. If not, contract is not valid for this dApp.
              cont = true;
            }
          }
          if(cont) {
            smartaddress = Base58.encode(byte_array(res.smartContractsList[index].address));
            select.append($("<option></option>").attr("value", smartaddress).text(smartaddress));
          }
        });
      }
        $('#contracts').html(select);
  } else { // If there are no smart contracts for this public key, show the following message.
      $('#contracts').text('No smart contracts found for this public key.');
  }
});
}

function walletBalance() { // Function to show balance of public key.
$('#balance').html('<img src="img/loader.svg" width="20" height="20">');
Connect().WalletBalanceGet(Base58.decode(sessionStorage.getItem('PublicKey')), function (r) {
  console.log(r);
    let fraction = String(r.balance.fraction / Math.pow(10, 18)).split(".")[1];

    if (fraction === undefined)
        fraction = 0;

    $('#balance').text(r.balance.integral + "." + fraction + " CS");

    if(r.balance.integral == '0' && fraction < '10') { // Show error when balance is below 0.1 CS
      $('#errorarea').html('<div class="alert alert-danger alert-dismissible" id="slidealert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Insufficient balance!</div>').show();
      $('#contractselect').hide();
    }	else {
      let contract = sessionStorage.getItem('SmartContract');
      if(contract == null) {
        $('#errorarea').hide();
        $('#contractselect').show();
      }	else {
        if($('#product_data').text().length == 0) {
          fetchData();
          $('#contractselect').hide();
        }	else {
          $('#contractselect').hide();
          $('#product_datalist').show();
        }
      }
    }
});
}

function fetchData() { // Send transaction to smart contract to request data.
  $('#add_button').show();
  $('#loading').show();
  $('#product_datalist').hide();
  $('#change').show();

  values = [];
  createTransaction("exportData", values, processData);
}

function processData(data, status, method) { // Process data after function fetchData succeeded.
  if(status == 0) { // transaction failed
    $('#errorarea').html('<div class="alert alert-danger alert-dismissible" id="slidealert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Transaction failed ' + data + '</div>').show();
    $('#loading').hide();
  } else {
    if(data != null) {
      data = JSON.parse(data); // Parse JSON
      let dataSet = new Array;

      $.each(data, function(index, value) { // Create a workable array in javascript
        dataSet.push([index, value[0], value[1]]);
      });

      table = $('#product_data').DataTable({ // Create datatable
        data: dataSet,
        rowId: 0,
        columns: [
          { title: "ID" },
          { title: "Desc." },
          { title: "Quantity" },
          { title: "Edit",
            "data": null,
            "render": function(data, type, full, meta) {
              return "<button type='button' name='update' id='" + data + "' class='btn btn-warning btn-xs update'>Edit</button>";
            }
          },
          { title: "Delete",
          "data": null,
          "render": function(data, type, full, meta) {
            return "<button type='button' name='delete' id='" + full[0] + "' class='btn btn-danger btn-xs delete'>Delete</button>";
            }
          },
        ],
        "columnDefs":[
          {
            "targets":[3, 4],
            "orderable":false,
          },
        ],
        "pageLength": 10,
        destroy: true,
      });

      $('#loading').hide();
      $('#product_datalist').show();
      $('#productlist_title').html('Product List ' + sessionStorage.getItem('SmartContract') + ' <a href="#" onclick="fetchData();"><span class="glyphicon glyphicon-refresh"></span></a>');
    }
  }
}

function processTx(message, status, method) { // Process result of transaction
  if(status == 0) { // transaction failed
    $('#errorarea').html('<div class="alert alert-danger alert-dismissible" id="slidealert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> <b>Transaction failed</b><br>' + message + '<br>Changes have not been saved to the blockchain!</div>').show();
  } else {
    if(method == 'addItem') {
      $('#product_id').empty();
      $('#product_name').empty();
      $('#product_quantity').empty();
      $('#productModal').modal('hide');
      $('#alert_action').html('<div class="alert alert-success alert-dismissible" id="slidealert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Article added succesfully!</div>');
      showAlert();
      $('#action').attr('disabled', false);
    } else if(method == 'addItems') {
      $('#alert_action').html('<div class="alert alert-success alert-dismissible" id="slidealert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Multiple changes succesfully processed!</div>');
      showAlert();

      $('#m_product_id').empty();
      $('#m_product_name').empty();
      $('#m_product_quantity').empty();
      $('#showchanges').fadeOut();
      $('#number').text('0');

      $('#applychanges_button').removeAttr("disabled");
    }	else if(method == 'deleteItem') {
      $('#product_id').empty();
      $('#product_name').empty();
      $('#product_quantity').empty();
      $('#productDelete').modal('hide');
      $('#alert_action').html('<div class="alert alert-success alert-dismissible" id="slidealert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>Succesfully deleted!</div>');
      showAlert();
      $('#action_delete').attr('disabled', false);
    }
  }
}

function addRow(values, index, e) { // Add, edit or remove row to datatable.
  let table = $('#product_data').DataTable();

  if(e == 0) {
    let rowNode = table
    .row("#"+index).remove()
    .row.add( values )
    .draw( false )
    .node();

    $( rowNode )
    .css( 'color', 'green' )
    .animate( { color: 'black' } );
  } else if(e == 2) {
    let rowNode = table
    .row("#"+index).remove()
    .draw( false );
  }
}

function discardChanges() {
  $('#m_product_id').empty();
  $('#m_product_name').empty();
  $('#m_product_quantity').empty();
  $('#showchanges').fadeOut();
  $('#number').text('0');

  fetchData();
}

function applyChanges() { // Apply changes in changelist. Create transaction to smart contract
  $('#applychanges_button').attr("disabled", "disabled");
  values = [
    { key: "STRING", value: $('#m_product_id').text() },
    { key: "STRING", value: $('#m_product_name').text() },
    { key: "STRING", value: $('#m_product_quantity').text() }
  ];
  let ids = $('#m_product_id').text().split(", ");
  transaction = createTransaction("addItems", values, processTx);
}

function showAlert() { // Show result for a few seconds before message disappears.
        $("#slidealert").fadeTo(3500, 600).slideUp(400, function () {
          $("#slidealert").slideUp(600);
      });
}

$(document).on('submit', '#product_delete', function(event){ // Delete a product
  event.preventDefault();
  $('#action_delete').attr('disabled', 'disabled');
  id = $("#delete_id").val();
  values = [
      { key: "INT", value: id }
  ];

  transaction = createTransaction("deleteItem", values, processTx); // Create transaction
  addRow(0, id, 2);
});

$(document).on('click', '#add_button', function() { // Show form to add a product
  $('#formerror').empty();
  $('#formerror').removeClass();
  $('input[type="text"]').css({"border" : "", "box-shadow" : ""});
  $('#productModal').modal('show');
  $('#product_id').val('');
  $('#product_name').val('');
  $('#product_quantity').val('');
  $('.modal-title').html("<i class='fa fa-plus'></i> Add Product");
  $('#action').val("Add");
  $('#btn_action').val("Add");
  $('#product_id').removeAttr("disabled");
  $('#row_id').val('-1');
});

$(document).on('click', '.update', function(){ // Show form to edit a product
  let edit = $(this).attr("id");
  let product_details = edit.split(",");

  $('#formerror').empty();
  $('#formerror').removeClass();
  $('input[type="text"]').css({"border" : "", "box-shadow" : ""});
  $('#productModal').modal('show');
  $('.modal-title').html("<i class='fa fa-pencil-square-o'></i> Edit Product");
  $('#product_id').val(product_details[0]);
  $('#product_id').attr("disabled", "disabled");
  $('#product_name').val(product_details[1]);
  $('#product_quantity').val(product_details[2]);
  $('#action').val("Edit");
  $('#btn_action').val("Edit");
  $('#row_id').val(edit[0]);
});

$(document).on('click', '.delete', function(){ // Show confirmationmodal to delete a product.
  let product_id = $(this).attr("id");
  $('#productDelete').modal('show');
  $('#delete_id').val(product_id);
});

$(document).on('click', '#action', function(){ // Send new or edited product.
  let cont = true;
  $('#action').attr('disabled', 'disabled');
  art_id = $("#product_id").val();
  art_name = $("#product_name").val();
  art_quantity = $("#product_quantity").val();

  if(isNaN(art_id) != false || art_id == '') {
    $('#product_id').css("border","2px solid red");
    $('#product_id').css("box-shadow","0 0 3px red");
    $('#formerror').append("Please enter product ID! <br />");
    cont = false;
  }

  if(art_name == '') {
    $('#product_name').css("border","2px solid red");
    $('#product_name').css("box-shadow","0 0 3px red");
    $('#formerror').append("Please enter product name! <br />");
    cont = false;
  }

  if(isNaN(art_quantity) != false || art_quantity == '') {
    $('#product_quantity').css("border","2px solid red");
    $('#product_quantity').css("box-shadow","0 0 3px red");
    $('#formerror').append("Please enter product quantity! <br />");
    cont = false;
  }

  if(!cont) {
    $('#action').attr('disabled', false);
    $('#formerror').addClass("alert alert-danger");
  }

  if(cont) {
    values = [
        { key: "INT", value: art_id },
        { key: "STRING", value: art_name },
        { key: "INT", value: art_quantity }
    ];
    addValue = [
      art_id,
      art_name,
      art_quantity,
    ];

    transaction = createTransaction("addItem", values, processTx); // Send transaction
    addRow(addValue, art_id, 0);
  }
});

$(document).on('click', '#addlist', function(){ // Add new or edited product to changelist
  let cont = true;
  art_id = $("#product_id").val();
  art_name = $("#product_name").val();
  art_quantity = $("#product_quantity").val();

  if(art_name == '') {
    $('#product_name').css("border","2px solid red");
    $('#product_name').css("box-shadow","0 0 3px red");
    $('#formerror').append("Please enter product name! <br />");
    cont = false;
  }

  if(isNaN(art_quantity) != false || art_quantity == '') {
    $('#product_quantity').css("border","2px solid red");
    $('#product_quantity').css("box-shadow","0 0 3px red");
    $('#formerror').append("Please enter product quantity! <br />");
    cont = false;
  }

  if(!cont) {
    $('#action').attr('disabled', false);
    $('#formerror').addClass("alert alert-danger");
  }

  if(cont) {
    $('#showchanges').fadeIn();
    $('#number').text(function(i,txt){ return parseInt(txt,10) + 1; });
    $('#productModal').modal('hide');

    art_id = $("#product_id").val();
    art_name = $("#product_name").val();
    art_quantity = $("#product_quantity").val();

    addValue = [
      art_id,
      art_name,
      art_quantity,
    ];

    addRow(addValue, art_id, 0); // Update datatable

    changeid = $('#m_product_id').text();
    $('#m_product_id').text(changeid + art_id + ', ');

    changename = $('#m_product_name').text();
    $('#m_product_name').text(changename + art_name + ', ');

    changequantity = $('#m_product_quantity').text();
    $('#m_product_quantity').text(changequantity + art_quantity + ', ');
  }
});
