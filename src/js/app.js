App = {
  web3Provider: null,
  profile: {},
  contracts: {},
  account: '0x0',
  loading: false,
  currentState: "0", // 0 is login |
  participantTyle: NaN,
  productListArray: new Array(),
  orderListArray: new Array(),

  init: function () {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function () {
    $.getJSON("Agrichain.json", function (agriChain) {
      App.contracts.AgriChain = TruffleContract(agriChain);
      App.contracts.AgriChain.setProvider(App.web3Provider);
      App.contracts.AgriChain.deployed().then(function (agriChain) {
        console.log("Contract Address:", 'https://rinkeby.etherscan.io/address/' + agriChain.address);

      });
      App.listenForEvents();
      return App.render();
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {

  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;

        console.log("Account Address:", 'https://rinkeby.etherscan.io/address/' + account);
      }
    });

    App.LoadLoginPage();

    content.show();
    loader.hide();

  },

  LoginUser: function () {

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.participants(App.account);
    }).then((participantDetail) => {
      App.profile = {};
      App.profile.account = participantDetail[0];
      App.profile.email = participantDetail[1];
      App.profile.fullname = participantDetail[2];
      App.profile.cellnumber = participantDetail[3];
      App.profile.type = participantDetail[5].toNumber();
      App.profile.accountBalance = 0;
      web3.eth.getBalance(App.account, (err, bal) => {
        if (err === null) {
          App.profile.accountBalance = web3.fromWei(bal, 'ether');
        }
      });

      console.log(App.profile.email);

      if (App.profile.account == App.account && App.profile.email == $('#username').val()) {

        //participantTyle = participantDetail[5].toNumber()
        App.LoadDefaultHomePage();

      } else {
        $('#alert').html('<div class="alert">Wrong credential!</div>');
        setTimeout(function () { App.LoadLoginPage(); }, 2000);
      }

      $('#content').show();
      $('#loader').hide();

    }).catch((error) => {
      $('#content').show();
      $('#loader').hide();
      $('#content').empty();
      $('#content').load('alert-success.html', function () {
        $('#message').html('Connection problem! Ethereum network not connected. Kindly check if MetaMask is loged in & Rinkeby Test network is selected. Kindly Try again. ' + error.message);
        $('#button').html('<a class="button_normal" onclick="App.LoadLoginPage();">Ok</a>');//LoadProducerListPage
      });
    })
  },

  RegisterUser: function () {

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    const type = parseInt($('#r_type').find(':selected').val());
    const fullname = $('#r_fullname').val();
    const email = $('#r_email').val();
    const cell = $('#r_cell').val();
    const password = $('#r_password').val();

    //console.log("type", type)

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.participants(App.account);
    }).then((participants) => {
      if (participants[0] == App.account) {
        loader.hide();
        content.show();
        $('#alert').html('<div class="alert">Account already registraed as ' + participants[1] + '</div>');
        console.log("*** User already exit with the Smart-Contract ***");
        setTimeout(function () { App.LoadLoginPage(); }, 3000);
        //, participants[5].toNumber();
      } else {
        return AgrichainInstance.signup(email, fullname, cell, password, type, {
          from: App.account,
          gas: 500000
        }).then((reply) => {
          console.log("User successfully created!");

          App.LoadLoginPage();
          loader.hide();
          content.show();

        })
      }
    });
  },

  PostAssets: function () {

    $('#content').hide();
    $('#loader').show();

    const harvers = $('#p_harvest').val();
    const comodity = parseInt($('#p_commodity').find(':selected').val());
    const acres = $('#p_acres').val();
    const _yield = $('#p_yield').val();
    const basic = $('#p_baiss').val();
    const Insurance = $('#p_insurance').val();
    const costs = $('#p_costs').val();
    const sellprice = $('#p_sellprice').val();

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.PostAssets(harvers, comodity, acres, _yield, basic, Insurance, costs, parseInt(_yield), sellprice, { from: App.account, gas: 5000000 })
        .then((reply) => {
          //console.log(reply);
          $('#content').show();
          $('#loader').hide();
          $('#content').empty();
          $('#content').load('alert-success.html', function () {
            $('#message').html('<strong>Congraluation,</strong> new assets has been successfully created. Your transaction hash <a href="https://rinkeby.etherscan.io/tx/' + reply.tx + '" target="_blank">' + reply.tx + '</a>');
            $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');//LoadProducerListPage
          });
        })
        .catch((error) => {
          console.log("error while saving assets", error.message);

          $('#content').show();
          $('#loader').hide();
          $('#content').empty();
          $('#content').load('alert-success.html', function () {
            $('#message').html('Failed to create new assets. Kindly try again latter.');
            $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');//LoadProducerListPage
          });

          //alert(error.message);
        })
    })
  },

  LoadLoginPage: function () {
    $('#content').empty();
    $('#content').load('login.html', function () {
      $('#alert').empty();
    });
  },

  LoadSignUpPage: function () {
    $('#content').empty();
    $('#content').load('register.html', function () {
      $('#alert').empty();
    });
  },

  LoadHomePage: function () {
    $('#content').empty();
    $('#content').load('Home-page.html');
  },

  LoadDistributorHomePage: function () {
    $('#content').empty();
    $('#content').load('Home-page-distributor.html');
  },

  LoadCustomerHomePage: function () {
    $('#content').empty();
    $('#content').load('Home-page-customers.html');
  },

  LoadProfileDetailPage: function () {
    $('#content').empty();
    $('#content').load('profile_detail.html', function () {
      $('#profileTitle').html(App.GetAccountTypeName(App.profile.type) + " Profile Detail");
      $('#email').html(App.profile.email);
      $('#fullname').html(App.profile.fullname);
      $('#cellnumber').html(App.profile.cellnumber);
      $('#accountId').html('<a href="https://rinkeby.etherscan.io/address/' + App.account + '"  target="_blank">' + App.account + '</a>')

      web3.eth.getBalance(App.account, (err, bal) => {
        if (err === null) {
          $('#accountBalance').html(web3.fromWei(bal, 'ether') + ' ETH');
        }
      });

      var qrcode = new QRCode("qrcode", { width: 128, height: 128, correctLevel: QRCode.CorrectLevel.H });
      qrcode.clear();
      qrcode.makeCode(App.account);

    });
  },

  LoadDefaultHomePage: function () {
    switch (App.profile.type) {
      case 0:
        App.LoadHomePage();
        //console.log("Is a Producer!")
        break;
      case 1:
        App.LoadDistributorHomePage();
        //console.log("Is a Distributor!")
        break;
      case 2:
        App.LoadCustomerHomePage();
        //console.log("Is a Consumner!")
        break;
    }
  },

  // CONSUMERS or CUSTOMERS  LoadCustomerDetailPage

  LoadCustomerDetailPage: function (param) {
    //console.log('Product Detail of:', param, App.productListArray[param].harvestYear)
    $('#content').empty();
    $('#content').load('customer_detail.html', function () {
      $('#p_harvest').val(App.productListArray[param].harvestYear);
      $('#p_commodity').val(App.productListArray[param].commodity);
      $('#p_acres').val(App.productListArray[param].totalAcer);
      $('#p_yield').val(App.productListArray[param].Qty);
      $('#p_baiss').val(App.productListArray[param].estimatedBasic);
      $('#p_insurance').val(App.productListArray[param].cropInsuranceCoverage);
      $('#p_costs').val(App.productListArray[param].productCost);
    });
  },

  LoadConsumberListPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('customer-list.html', function () {

      App.LoadAllAssetsByAccType(App.account);

      setTimeout(function () {
        //console.log("App.productListArray " , App.productListArray.length)
        $('#content').show();
        $('#loader').hide();

        for (let each in App.productListArray) {
          (function (idx, arr) {
            let str = '<div class="item item-icon-right">&nbsp;&nbsp;'
            str += '<a onclick="App.LoadCustomerDetailPage(' + parseInt(idx) + ');" class="year">' + arr[idx].harvestYear + '</a>&nbsp;&nbsp;';
            str += '<a onclick="App.LoadCustomerDetailPage(' + parseInt(idx) + ');" class="product">' + arr[idx].commodity + '</a>&nbsp;&nbsp;';
            str += '<a onclick="App.LoadCustomerDetailPage(' + parseInt(idx) + ');" class="yield">' + arr[idx].Qty + '</a>&nbsp;&nbsp;';
            str += '</div>'
            $('#ConsumerProductLists').append(str);

          })(each, App.productListArray);
        }
      }, 3000)

    });
  },


  ConsumerBuyRequest: function () {


    const addr = $('#distri_produ_list').find(':selected').val();
    const assetId = $('#distri_produ_list_item').find(':selected').val();
    const quantity = parseInt($('#s_quantity').val());

    $('#loader').show();
    $('#content').hide();
    //$('#content').empty();

    //console.log("Asset Id", assetId);

    let _disname = '';
    let _assetName = '';
    let _sellPrice = '';

    for (let each in App.productListArray) {
      (function (idx, arr) {
        //console.log("Buy Asset Index: ", arr[idx].index, assetId);
        if (arr[idx].index == assetId) {
          _assetName = String(arr[idx].harvestYear + ' - ' + arr[idx].commodity);
          _disname = String(arr[idx].disEmail);
          _sellPrice = arr[idx].sellPrice;
        }
      })(each, App.productListArray)
    }


    //console.log(addr, assetId, quantity);

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.getAssetsIndex({ from: App.account });
    }).then((assetIndex) => {

      let isExist = false;

      for (let each in assetIndex) {
        (function (idx, arr) {
          //console.log(arr[idx].toNumber(), parseInt(assetId), "<-");
          if (arr[idx].toNumber() == parseInt(assetId)) {
            isExist = true;
          }
          //console.log("isExist-in", isExist)
        })(each, assetIndex)
      }
      //console.log("isExist-out", isExist)
      if (isExist) {
        $('#loader').hide();
        $('#content').show();
        $('#content').empty();
        $('#content').load('alert-success.html', function () {
          $('#message').html('The asset selected has already been bought. Kindly select another asset.');
          $('#button').html('<a class="button_normal" onclick="App.LoadTradeConsumerPage();">Ok</a>');
        });
        //console.log("Load message, already exist")
      } else {
        return AgrichainInstance.getQtyData(addr, assetId)
          .then((disQuantity) => {
            //console.log("Available Quantity:", disQuantity.toNumber())
            if (disQuantity.toNumber() > 0) {
              const setPrice = parseFloat(_sellPrice);
              const grandTotla = parseFloat(setPrice * quantity);

              let price = web3.toWei(String(grandTotla), 'ether');

              //console.log("TX-Det: Asset Id:", assetId, "Setprice:", setPrice, "Quantity:", quantity, "GrandTotal:", grandTotla, "Price:", price);

              /*return "grood";*/

              return AgrichainInstance.ConsumerPurchase(addr, assetId, quantity, { from: App.account, value: price })
                .then((receipt) => {
                  $('#content').show();
                  $('#loader').hide();
                  $('#content').empty();
                  $('#content').load('alert-success.html', function () {
                    $('#message').html("Transactoin Successful! " + quantity + " Kg of " + _assetName + " bought from " + addr + " at " + _sellPrice + " ETH. Your transaction hash is " + receipt.tx);
                    $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');//LoadProducerListPage
                  });
                })
            } else {
              $('#loader').hide();
              $('#content').show();
              $('#content').empty();
              $('#content').load('alert-success.html', function () {
                $('#message').html('Stock not available.');
                $('#button').html('<a class="button_normal" onclick="App.LoadTradeConsumerPage();">Ok</a>');
              });
            }
          })
      }

    }).catch((error) => {
      //console.log(error.message);
      $('#loader').hide();
      $('#content').show();
      $('#content').empty();
      $('#content').load('alert-success.html', function () {
        $('#message').html('<strong>::Error::</strong> ' + error.message);
        $('#button').html('<a class="button_normal" onclick="App.LoadTradeConsumerPage();">Ok</a>');
      });
      //App.LoadTradeDistributorPageAllOrders();
    })

  },

  LoadAllProduAssetForConsumer: function () {

    $('#s_product_list').empty();
    $('#s_product_list').append('Loading...');

    const distributorAddr = $('#distri_produ_list').find(':selected').val();

    App.LoadAllAssetsByAccType(distributorAddr);

    setTimeout(function () {
      //console.log(App.productListArray)
      let str = '<select id="distri_produ_list_item" class="form-control prof_right_input">';

      for (let each in App.productListArray) {
        (function (idx, arr) {
          if (arr[idx].Qty > 0) {
            str += '<option value="' + arr[idx].index + '">' + arr[idx].harvestYear + ' - ' + arr[idx].commodity + ' - (' + arr[idx].Qty + ' @ ' + arr[idx].sellPrice + ' Eth)</option>';
          }
        })(each, App.productListArray)
      }

      str += '</select>'
      $('#s_product_list').empty();
      $('#s_product_list').append(str);

    }, 2000);


  },

  LoadTradeConsumerPage: function () {
    //product_consumer_trade.html
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('product_consumer_trade.html', function () {
      //$('#content').show();
      //$('#loader').hide();

      App.contracts.AgriChain.deployed().then(function (instance) {
        AgrichainInstance = instance;
        return AgrichainInstance.getAllDistributors()

      }).then((AllDistributors) => {
        //console.log(AllDistributors);

        if (!AllDistributors.length) {
          $('#loader').hide();
          $('#content').show();
          $('#content').empty();
          $('#content').load('alert-success.html', function () {
            $('#message').html("No distributor available. Kindly add a distributor into the Smart-Contract.");
            $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');
          });
        }

        $('#s_distributor').empty();
        $('#s_distributor').append('Loading...');

        // LOAD PRODUCER LIST!
        let length = AllDistributors.length;
        let str = '<select id="distri_produ_list" class="form-control prof_right_input">';

        for (let each in AllDistributors) {
          (function (idx, arr) {
            //console.log(arr[idx])

            return AgrichainInstance.participants(arr[idx])
              .then((reply) => {
                //console.log(reply[0]);
                str += '<option value="' + reply[0] + '">' + reply[1] + '</option>';

                if (length - 1 == idx) {

                  $('#content').show();
                  $('#loader').hide();

                  setTimeout(function () {
                    str += '</select><a class="button_normal" onclick="App.LoadAllProduAssetForConsumer();">Load Assets from Distributors</a>';
                    $('#s_distributor').empty();
                    $('#s_distributor').append(str);

                  }, 2000);
                }
              })
          })(each, AllDistributors);
        }
      });
    })

  },

  // DISTRIBUTORS COLLECTION

  CreateOrderRequestPost: function () {
    const producerAddr = $('#distri_produ_list').find(':selected').val();
    const assetId = $('#distri_produ_list_item').find(':selected').val();
    const quantity = $('#s_quantity').val();

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.quantitys(assetId)
    }).then((assetQuantity) => {
      const availableQuantity = assetQuantity[1].toNumber();
      const setPrice = parseFloat(assetQuantity[2]);
      const grandTotla = setPrice * quantity;
      //console.log(grandTotla, quantity)

      return AgrichainInstance.CreateOrder(producerAddr, assetId, quantity, grandTotla, { from: App.account })

    }).then((receipt) => {
      $('#content').show();
      $('#loader').hide();
      $('#content').empty();
      $('#content').load('alert-success.html', function () {
        $('#message').html('Asset order has been succcessfully placed. Your transaction hash is ' + receipt.tx);
        $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');//LoadProducerListPage
      });
    })
  },

  CreateOrderRequest: function () {
    const producerAddr = $('#distri_produ_list').find(':selected').val();
    const assetId = $('#distri_produ_list_item').find(':selected').val();
    const quantity = $('#s_quantity').val();

    $('#content').hide();
    $('#loader').show();

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.getAssetsIndex({ from: App.account })

    }).then((assetIndex) => {
      let exist = false;
      for (let each in assetIndex) {
        (function (idx, arr) {
          if (arr[idx].toNumber() == parseInt(assetId)) {

            $('#content').show();
            $('#loader').hide();
            $('#content').empty();
            $('#content').load('alert-success.html', function () {
              $('#message').html('Failed to create new order for assets. Asset has already been bought.');
              $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');//LoadProducerListPage
            });

            exist = true;
          }
        })(each, assetIndex);
      }

      if (!exist) {
        App.CreateOrderRequestPost();
      }
    })


  },

  DistributorProcessPayment: function (orderid) {
    let _quantity = '';
    let _price = 0;
    let _assetName = '';

    $('#content').hide();
    $('#loader').show();
    $('#content').empty();

    for (let each in App.orderListArray) {
      (function (idx, arr) {

        if (arr[idx].index == orderid) {
          _assetName = String(arr[idx].harvestYear + ' - ' + arr[idx].commodity);
          _proname = String(arr[idx].proEmail);
          _price = parseFloat(arr[idx].sellPrice) * arr[idx].qty;
        }
      })(each, App.orderListArray)
    }

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.orders(orderid);
    }).then((order) => {
      _quantity = order[5].toNumber();
      //_price = order[6].toNumber();
      let priceInWei = web3.toWei(String(_price), 'ether');

      //console.log(order[2], "i: ", order[0].toNumber(), "p: " + order[6].toNumber(), _price, priceInWei);
      //return "good";
      return AgrichainInstance.DistributorPurchase(String(order[2]), order[0].toNumber(), { from: App.account, value: priceInWei });
    }).then((receipt) => {
      //console.log(receipt);
      //console.log(_quantity, _assetName, _proname, )
      $('#content').show();
      $('#loader').hide();
      $('#content').empty();
      $('#content').load('alert-success.html', function () {
        $('#message').html("Transactoin Successful! " + _quantity + " Kg of " + _assetName + " sold to " + _proname + " at " + _price + " ETH. Your transaction hash is " + receipt.tx);
        $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');
      });
    }).catch((error) => {
      //console.log(error.message);
      $('#loader').hide();
      $('#content').show();
      $('#content').empty();
      $('#content').load('alert-success.html', function () {
        $('#message').html('<strong>Error:</strong> ' + error.message);
        $('#button').html('<a class="button_normal" onclick="App.LoadTradeDistributorPageAllOrders();">Ok</a>');
      });
      //App.LoadTradeDistributorPageAllOrders();
    })
  },

  LoadTradeDistributorPageAllOrders: function () {

    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('product_distributor_trade_allorders.html', function () {

      //console.log("Show all order page");
      App.LoadCompleteOrderList();


      setTimeout(function () {
        console.log("Order List: ", App.orderListArray.length);
        $('#content').show();
        $('#loader').hide();
        $('#produce_order_list').empty();
        //$('#produce_order_list').html(str);

        if (!App.orderListArray.length) {
          $('#produce_order_list').empty();
          //$('#content').load('alert-success.html', function () {
          $('#produce_order_list').append('Order list empty. Please try again.');
          //$('#message').html('Order list empty. Please try again.');
          //$('#button').html('<a class="button_normal" onclick="App.LoadTradeDistributorPage();">Ok</a>');
          //});
        }

        for (let each in App.orderListArray) {
          (function (idx, arr) {
            //console.log(idx, arr[idx]);
            //console.log(idx, arr[idx].distributor, App.account);
            if (arr[idx].distributor == App.account) {

              let str = '<div class="item item-icon-right">&nbsp;&nbsp;'
              str += '<a class="year">' + arr[idx].harvestYear + '</a>&nbsp;&nbsp;';
              str += '<a class="product">' + arr[idx].commodity + '</a>&nbsp;&nbsp;';
              str += '<a class="yield">' + arr[idx].qty + '</a>KG&nbsp;@&nbsp;';
              str += '<a class="yield">' + arr[idx].sellPrice + ' Eth</a>&nbsp;&nbsp;From:&nbsp;';
              str += '<a class="yield">' + arr[idx].proEmail + '</a>&nbsp;&nbsp;';
              str += '<a class="yield" ';
              switch (arr[idx].repState) {
                case 0:
                  str += 'style="color:gray;font-style: italic;">Current Status: Pending';
                  break;
                case 1:
                  str += 'style="color:green;font-style: italic;">Current Status: Accepted';
                  break;
                case 2:
                  str += 'style="color:red;font-style: italic;">Current Status: Rejected';
                  break;
                case 3:
                  str += 'style="color:purple;font-style: italic;">Current Status: Received';
                  break;
                default:
                  str += '>';
                  break;
              }
              str += '</a>&nbsp;&nbsp;';

              if (arr[idx].repState == 1) {
                str += '<a class="yield button_normal" onclick="App.DistributorProcessPayment(' + arr[idx].index + ');">Received</a>&nbsp;&nbsp;';
              } else {
                str += '&nbsp;'
              }

              str += '</div>'

              $('#produce_order_list').append(str);


            }

          })(each, App.orderListArray);

        }
      }, 5000)
    })
  },

  LoadTradeDistributorPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('product_distributor_trade.html', function () {
      //s_distributor
      App.contracts.AgriChain.deployed().then(function (instance) {
        AgrichainInstance = instance;
        return AgrichainInstance.getAllProducers();
      }).then((AllProducers) => {

        if (!AllProducers.length) {
          $('#loader').hide();
          $('#content').show();
          $('#content').empty();
          $('#content').load('alert-success.html', function () {
            $('#message').html("<strong>Failed,</strong> no producers available. Kindly add a producer into the Smart-Contract.");
            $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');
          });
        }

        $('#s_distributor').empty();
        $('#s_distributor').append('Loading...');

        // LOAD PRODUCER LIST!
        let length = AllProducers.length;
        let str = '<select id="distri_produ_list" class="form-control prof_right_input">';

        for (let each in AllProducers) {
          (function (idx, arr) {
            //console.log(arr[idx])

            return AgrichainInstance.participants(arr[idx])
              .then((reply) => {
                //console.log(reply[0]);
                str += '<option value="' + reply[0] + '">' + reply[1] + '</option>';

                if (length - 1 == idx) {

                  $('#content').show();
                  $('#loader').hide();

                  setTimeout(function () {
                    str += '</select><a class="button_normal" onclick="App.LoadAllProduAssetForDistri();">Load Assets from Producer</a>';
                    $('#s_distributor').empty();
                    $('#s_distributor').append(str);

                  }, 2000);
                }
              })
          })(each, AllProducers);
        }
      })
    });
  },

  LoadAllProduAssetForDistri: function () {

    $('#s_product_list').empty();
    $('#s_product_list').append('Loading...');

    const producerAddr = $('#distri_produ_list').find(':selected').val();

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.getAssetsIndex({ from: producerAddr })
        .then((assetsIndex) => {

          const length = assetsIndex.length;
          let str = '<select id="distri_produ_list_item" class="form-control prof_right_input">';

          for (let each in assetsIndex) {
            (function (idx, arr) {
              //console.log(idx, arr[idx].toNumber())
              return AgrichainInstance.assets(arr[idx].toNumber())
                .then((assets) => {
                  //console.log(idx, assets);

                  return AgrichainInstance.quantitys(arr[idx].toNumber())
                    .then((quantity) => {
                      if (quantity[1].toNumber() > 0) {
                        str += '<option value="' + assets[0].toNumber() + '">' + assets[2] + ' - ' + App.GetCommodityName(assets[3].toNumber()) + ' - (' + quantity[1].toNumber() + ' @ ' + quantity[2] + ')</option>';
                      }

                      if (length - 1 == idx) {
                        setTimeout(function () {
                          str += '</select>'
                          $('#s_product_list').empty();
                          $('#s_product_list').append(str);
                        }, 2000);
                      }

                    })


                })
            })(each, assetsIndex);
          }

        });
    })
  },

  LoadDistributorDetailPage: function (param) {
    //console.log('Product Detail of:', param, App.productListArray[param].harvestYear)
    $('#content').empty();
    $('#content').load('distributor_detail.html', function () {
      $('#p_harvest').val(App.productListArray[param].harvestYear);
      $('#p_commodity').val(App.productListArray[param].commodity);
      $('#p_acres').val(App.productListArray[param].totalAcer);
      $('#p_yield').val(App.productListArray[param].Qty);
      $('#p_baiss').val(App.productListArray[param].estimatedBasic);
      $('#p_insurance').val(App.productListArray[param].cropInsuranceCoverage);
      $('#p_costs').val(App.productListArray[param].productCost);
      $('#p_buyprice').val(App.productListArray[param].sellPrice);
    });
  },

  // load all assets by account id

  LoadAllAssetsByAccType: function (param) {
    App.productListArray = new Array();

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.getAssetsIndex({ from: param });
    }).then((assetItems) => {
      for (let each in assetItems) {
        (function (idx, arr) {
          //console.log("Load-Assets::AssetFound", arr[idx].toNumber());
          AgrichainInstance.assets(arr[idx].toNumber())
            .then((assetItem) => {
              let producerObject = new Object();
              producerObject.index = assetItem[0].toNumber();
              producerObject.created = assetItem[1].toNumber();
              producerObject.harvestYear = assetItem[2];
              producerObject.commodity = App.GetCommodityName(assetItem[3].toNumber());
              producerObject.totalAcer = assetItem[4];
              producerObject.averageYield = assetItem[5];
              producerObject.estimatedBasic = assetItem[6];
              producerObject.cropInsuranceCoverage = assetItem[7];
              producerObject.productCost = assetItem[8];
              AgrichainInstance.quantitys(assetItem[0].toNumber())
                .then((quantity) => {
                  producerObject.totQty = quantity[0].toNumber();
                  producerObject.avaiQty = quantity[1].toNumber();
                  producerObject.sellPrice = quantity[2];

                  if (App.profile.type == 0) {
                    App.productListArray.push(producerObject);
                  } else {
                    AgrichainInstance.getQtyData(param, assetItem[0].toNumber())
                      .then((qty) => {
                        producerObject.Qty = qty.toNumber();
                        App.productListArray.push(producerObject);
                      })
                  }
                })

            })
        })(each, assetItems);
      }
    })
  },

  LoadDistributorListPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('distributor-list.html', function () {
      App.LoadAllAssetsByAccType(App.account);
      setTimeout(function () {

        $('#content').show();
        $('#loader').hide();
        $('#DistributorProductLists').empty();

        if (!App.productListArray.length) {

          $('#DistributorProductLists').append('<div>No assets available.</div>');
        }

        //console.log(App.productListArray);
        for (let each in App.productListArray) {
          (function (idx, arr) {
            let str = '<div class="item item-icon-right">&nbsp;&nbsp;'
            str += '<a onclick="App.LoadDistributorDetailPage(' + parseInt(idx) + ');" class="year">' + arr[idx].harvestYear + '</a>&nbsp;&nbsp;';
            str += '<a onclick="App.LoadDistributorDetailPage(' + parseInt(idx) + ');" class="product">' + arr[idx].commodity + '</a>&nbsp;&nbsp;';
            str += '<a onclick="App.LoadDistributorDetailPage(' + parseInt(idx) + ');" class="yield">' + arr[idx].Qty + '</a>Kg&nbsp;&nbsp;';
            str += '<a onclick="App.LoadDistributorDetailPage(' + parseInt(idx) + ');" class="yield">' + arr[idx].sellPrice + 'Eth</a>&nbsp;&nbsp;';

            str += '</div>'
            $('#DistributorProductLists').append(str);

          })(each, App.productListArray);
        }

      }, 3000);

    });
  },

  // PRODUCERS 

  LoadProducerListPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('producer-list.html', function () {


      // Empty Product list array
      App.productListArray = new Array();

      App.contracts.AgriChain.deployed().then(function (instance) {
        AgrichainInstance = instance;
        return AgrichainInstance.getAssetsIndex({ from: App.account });
      }).then((assetItems) => {
        //console.log("Asset List", assetItems)

        //let assetIndexArray = new Array();
        if (!assetItems.length) {
          $('#content').show();
          $('#loader').hide();
          $('#ProducerProductLists').append('<div>No assets available.</div>');
        }

        let str = '';
        let assetLength = assetItems.length;

        for (let each in assetItems) {
          (function (idx, arr, done) {
            //console.log(idx, arr[idx].toNumber());
            //assetIndexArray.push(arr[idx].toNumber())

            return AgrichainInstance.assets(arr[idx].toNumber())
              .then((assetItem) => {
                //console.log("Asset Item", idx, assetItem[0].toNumber())
                //console.log(assetItem[2].toNumber())

                let producerObject = new Object();
                producerObject._index = assetItem[0].toNumber();
                producerObject.created = assetItem[1].toNumber();
                producerObject.harvestYear = assetItem[2];
                producerObject.commodity = App.GetCommodityName(assetItem[3].toNumber());
                producerObject.totalAcer = assetItem[4];

                producerObject.estimatedBasic = assetItem[6];
                producerObject.cropInsuranceCoverage = assetItem[7];
                producerObject.productCost = assetItem[8];

                if (App.profile.type == 0) {
                  return AgrichainInstance.quantitys(assetItem[0].toNumber())
                    .then((quantity) => {
                      //console.log(arr[idx].toNumber(), quantity)
                      producerObject.averageYieldTotal = quantity[0].toNumber();
                      producerObject.averageYield = quantity[1].toNumber();
                      producerObject.sellprice = parseFloat(quantity[2]);
                      App.productListArray.push(producerObject);

                      str += '<div class="item item-icon-right">&nbsp;&nbsp;'
                      str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="year">' + assetItem[2] + '</a>&nbsp;&nbsp;';
                      str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="product">' + App.GetCommodityName(assetItem[3].toNumber()) + '</a>&nbsp;&nbsp;';
                      str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="yield">' + quantity[1].toNumber() + '/' + quantity[0].toNumber() + '</a>&nbsp;&nbsp;';
                      str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="yield">@' + quantity[2] + 'ETH</a>&nbsp;&nbsp;';
                      str += '</div>'


                      if (assetLength - 1 == idx) {
                        $('#ProducerProductLists').empty();
                        $('#ProducerProductLists').append('Loading...');
                        $('#content').show();
                        $('#loader').hide();
                        setTimeout(function () {
                          //console.log('[append]', str.length);

                          $('#ProducerProductLists').empty();
                          $('#ProducerProductLists').append(str);
                          //console.log("App.productListArray: " , App.productListArray)
                        }, 2000);
                      }

                    })
                }









              })

          })(each, assetItems)


        }

      })
    });
  },

  LoadProducerDetailPage: function (param) {
    //console.log('Product Detail of:', param, App.productListArray[param].harvestYear)
    $('#content').empty();
    $('#content').load('product_detail.html', function () {
      $('#p_harvest').val(App.productListArray[param].harvestYear);
      $('#p_commodity').val(App.productListArray[param].commodity);
      $('#p_acres').val(App.productListArray[param].totalAcer);
      $('#p_yield_total').val(App.productListArray[param].averageYieldTotal);
      $('#p_yield').val(App.productListArray[param].averageYield);
      $('#p_baiss').val(App.productListArray[param].estimatedBasic);
      $('#p_insurance').val(App.productListArray[param].cropInsuranceCoverage);
      $('#p_costs').val(App.productListArray[param].productCost);
      $('#p_sellprice').val(App.productListArray[param].sellprice);
    });
  },

  LoadCompleteOrderList: function () {
    // orderListArray
    App.orderListArray = new Array();

    let totalOrders = 0;

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.orderIndex();
    }).then((_totalOrders) => {
      totalOrders = _totalOrders.toNumber();
      console.log("Total Orders Count:", totalOrders);


      for (let i = 0; i < totalOrders; i++) {
        //console.log(i);
        AgrichainInstance.orders(parseInt(i + 1))
          .then((order) => {
            //console.log(order)
            //console.log("==================================");
            let obj = {};
            obj.index = order[0].toNumber();
            obj.created = order[1].toNumber();
            obj.producer = order[2];
            obj.distributor = order[3];
            obj.AssetIndex = order[4].toNumber();
            obj.qty = order[5].toNumber();
            obj.price = order[6].toNumber();
            obj.state = order[7].toNumber();
            obj.repState = order[8].toNumber();
            obj.delivery = order[9].toNumber();

            AgrichainInstance.assets(order[4].toNumber()).then((asset) => {
              obj.harvestYear = asset[2];
              obj.commodity = App.GetCommodityName(asset[3].toNumber());

              AgrichainInstance.participants(order[2]).then((distributor) => {
                obj.proEmail = distributor[1];
                obj.proName = distributor[2];

                AgrichainInstance.participants(order[3]).then((distributor) => {
                  obj.disEmail = distributor[1];
                  obj.disName = distributor[2];

                  AgrichainInstance.quantitys(order[4].toNumber()).then((quantity) => {
                    obj.sellPrice = quantity[2];
                    App.orderListArray.push(obj);

                    //console.log(obj.index, i, App.orderListArray.length);

                  }).catch((error) => {
                    console.log("Error loading asset quantity.", error.message);
                  })
                }).catch((error) => {
                  console.log("Error loading participant details.", error.message);
                });
              }).catch((error) => {
                console.log("Error loading participant details.", error.message);
              });
            }).catch((error) => {
              console.log("Error loading asset details.", error.message);
            })
          }).catch((error) => {
            console.log("Error loading order details.", error.message);
          })
      }

    })
  },

  UpdateOrderState: function (OrderIndex, OrderState, OrderReplyState) {
    // Order id, Order State, Order Reply Status, Delivery time
    // return AgrichainInstance.UpdateOrder(OrderIndex, OrderState, OrderReplyState, 1, {from:App.account});
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.UpdateOrder(OrderIndex, OrderState, OrderReplyState, 1, { from: App.account });
    }).then((reply) => {
      $('#content').show();
      $('#loader').hide();
      $('#content').load('alert-success.html', function () {
        $('#message').html('Order state submitted successfully. Your transaction hash is ' + reply.tx);
        $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');
      });
    })

  },

  LoadTradeProducerPage: function () {
    let totalOrders = 0;
    let str = '';

    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('product_producer_trade.html', function () {

      App.LoadCompleteOrderList();
      setTimeout(function () {
        console.log("Order List: ", App.orderListArray.length);
        //producer@company.com
        $('#content').show();
        $('#loader').hide();
        $('#produce_order_list').empty();

        if (!App.orderListArray.length) {
          $('#produce_order_list').empty();
          //$('#content').load('alert-success.html', function () {
          $('#produce_order_list').append('Order list empty. Please try again.');
          //$('#message').html('Order list empty. Please try again.');
          //$('#button').html('<a class="button_normal" onclick="App.LoadTradeDistributorPage();">Ok</a>');
          //});
        }
        //$('#produce_order_list').html(str);
        for (let each in App.orderListArray) {
          (function (idx, arr) {
            //console.log(arr[idx])
            //let date = new Date(arr[idx].created)
            if (arr[idx].producer == App.account) {

              let str = '<div class="item item-icon-right">&nbsp;&nbsp;'
              str += '<a class="year">' + arr[idx].harvestYear + '</a>&nbsp;&nbsp;';
              str += '<a class="product">' + arr[idx].commodity + '</a>&nbsp;&nbsp;';
              str += '<a class="yield">' + arr[idx].qty + '</a>KG&nbsp;@&nbsp;';
              str += '<a class="yield">' + arr[idx].sellPrice + ' Eth</a>&nbsp;&nbsp;To:&nbsp;';
              str += '<a class="yield">' + arr[idx].disEmail + '</a>&nbsp;&nbsp;';

              //str += '<a class="button_normal" onclick="App.UpdateOrderState(' + arr[idx].index + ', 1, 1);">Accept</a>&nbsp;&nbsp;<a class="button_normal" onclick="App.UpdateOrderState(' + arr[idx].index + ', 1, 2);">Reject</a>';
              switch (arr[idx].repState) {
                case 0:
                  str += '<div style="300px;"><table border="0"><tr>';
                  str += '<td width="60">Delivery Date:</td>';
                  str += '<td width="80"><select class="form-control prof_right_input">';
                  str += '<option selected>Date</option>';
                  for (let dt = 1; dt < 32; dt++) {
                    str += '<option>' + dt + '</option>';
                  }
                  str += '</select></td>';
                  str += '<td width="80"><select class="form-control prof_right_input">';
                  str += '<option selected>Month</option>';
                  for (let mt = 1; mt < 13; mt++) {
                    str += '<option>' + mt + '</option>';
                  }
                  str += '</select></td>';
                  str += '<td width="80"><select class="form-control prof_right_input">';
                  str += '<option selected>Year</option>';
                  for (let yr = 2018; yr > 1918; yr--) {
                    str += '<option>' + yr + '</option>';
                  }
                  str += '</select></td>';
                  str += '</tr></table></div>';
                  str += '<input type="date"/><a class="button_normal" onclick="App.UpdateOrderState(' + arr[idx].index + ', 1, 1);">Accept</a>&nbsp;&nbsp;<a class="button_normal" onclick="App.UpdateOrderState(' + arr[idx].index + ', 1, 2);">Reject</a>';
                  break;
                case 1:
                  str += '<a class="yield" style="color:green;font-style: italic;">Current Status: Accepted</a>&nbsp;&nbsp;';
                  break;
                case 2:
                  str += '<a class="yield" style="color:red;font-style: italic;">Current Status: Rejected</a>&nbsp;&nbsp;';
                  break;
                case 3:
                  str += '<a class="yield" style="color:purple;font-style: italic;">Current Status: Delivered</a>&nbsp;&nbsp;';
                  break;
                default:
                  str += '<a class="yield" >&nbsp;</a>&nbsp;';
                  break;
              }


              /*if (arr[idx].repState == 1) {
                str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="yield button_normal" onclick="App.DistributorProcessPayment(' + arr[idx].index + ');">Received</a>&nbsp;&nbsp;';
              } else {
                str += '&nbsp;'
              }*/

              str += '</div>'

              //let str = '<div class="item item-icon-right">&nbsp;&nbsp;' + arr[idx].harvestYear + ' - ' + arr[idx].commodity ;
              //str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="year">' + assetItem[2] + '</a>&nbsp;&nbsp;';
              //str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="product">' + App.GetCommodityName(assetItem[3].toNumber()) + '</a>&nbsp;&nbsp;';
              //str += '<a onclick="App.LoadProducerDetailPage(' + parseInt(App.productListArray.length - 1) + ');" class="yield">' + quantity[1].toNumber() + '</a>&nbsp;&nbsp;';
              //str += '</div>'
              $('#produce_order_list').append(str);
              //$( "#datepicker" ).datepicker();

            }

          })(each, App.orderListArray);

        }

      }, 5000);



    });
  },

  LoadProductProducerPage: function () {
    $('#content').empty();
    $('#content').load('product_producer.html');
  },

  SellProductToDistributor: function () {
    $('#content').hide();
    $('#loader').show();

    const distributor = $('#s_distributor').find(':selected').val();
    const _index = parseInt($('#s_product_list').find(':selected').val());
    const _distname = $('#s_distributor').find(':selected').text();
    const _itemName = $('#s_product_list').find(':selected').text();
    const quantity = $('#s_quantity').val();

    //console.log(distributor, _distname, _itemName, _index, quantity);

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;

      return AgrichainInstance.quantitys(_index)
        .then((_quantity) => {
          if (parseInt(quantity) <= _quantity[1].toNumber()) {
            return AgrichainInstance.sellToDistributor(distributor, _index, quantity)
              .then(() => {
                $('#content').show();
                $('#loader').hide();
                $('#content').empty();
                $('#content').load('alert-success.html', function () {
                  $('#message').html("<strong>Success,</strong> " + quantity + " Kg of " + _itemName + " sold to " + _distname);
                  $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');
                });
              })
          } else {
            $('#content').show();
            $('#loader').hide();
            $('#content').empty();
            $('#content').load('alert-success.html', function () {
              $('#message').html("<strong>Failed,</strong> Not enought stock available.");
              $('#button').html('<a class="button_normal" onclick="App.LoadDefaultHomePage();">Ok</a>');
            });
          }
        })

    })
  },

  GetAccountTypeName: function (param) {
    let str = '';
    switch (param) {
      case 0:
        str = 'Producer';
        break;
      case 1:
        str = 'Distributor';
        break;
      case 2:
        str = 'Consumer';
        break;
      default:
        break;
    }
    return str;
  },

  GetCommodityName: function (param) {
    //POTATO, APPLES, , , , , 
    //console.log(param, typeof(param));
    let str = '';
    switch (param) {
      case 0:
        str = "POTATO";
        break;

      case 1:
        str = "APPLES";
        break;

      case 2:
        str = "STRAWBERRY";
        break;

      case 3:
        str = "BLUEBERRY";
        break;

      case 4:
        str = "BLUEB";
        break;

      case 5:
        str = "WHEAT";
        break;

      case 6:
        str = "OAT";
        break;

      default:
        str = "";
        break;
    }
    return str;
  },
}

$(function () {
  $(window).load(function () {
    App.init();
  })
});
