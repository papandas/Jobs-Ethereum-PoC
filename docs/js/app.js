App = {
  web3Provider: null,
  myProfile: {},
  contracts: {},
  account: '0x0',
  loading: false,
  seekerListArray: new Array(),

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
    $.getJSON("Jobs.json", function (jobs) {
      App.contracts.Jobs = TruffleContract(jobs);
      App.contracts.Jobs.setProvider(App.web3Provider);
      App.contracts.Jobs.deployed().then(function (jobs) {
        console.log("Contract Address:", 'https://rinkeby.etherscan.io/address/' + jobs.address);
      });

      return App.render();
    })
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

    App.LoadLandingPage();





  },

  LoadLandingPage: function () {
    App.contracts.Jobs.deployed().then(function (instance) {
      JobsInstance = instance;
      return JobsInstance.seekers(App.account);
    }).then((isExist) => {
      if (isExist) {
        App.contracts.Jobs.deployed().then(function (instance) {
          JobsInstance = instance;
          return JobsInstance.jobIndex();
        }).then((totalJobIndex) => {

          App.seekerListArray = new Array();

          for (let i = 1; i <= totalJobIndex.toNumber(); i++) {
            JobsInstance.jobs(i).then((seekers) => {
              //console.log(seekers[4]);
              let obj = {};
              obj.index = seekers[0].toNumber();
              obj.active = seekers[1];
              obj.address = seekers[2];
              obj.AccountType = seekers[3].toNumber();
              obj.name = seekers[4];
              obj.ExpertiseType = seekers[5].toNumber();
              obj.year = seekers[6].toNumber();
              obj.DoW = seekers[7].toNumber();
              obj.salary = seekers[8].toNumber();

              if (seekers[2] == App.account) {
                App.myProfile = {};
                App.myProfile.index = seekers[0].toNumber();
                App.myProfile.active = seekers[1];
                App.myProfile.address = seekers[2];
                App.myProfile.AccountType = seekers[3].toNumber();
                App.myProfile.name = seekers[4];
                App.myProfile.ExpertiseType = seekers[5].toNumber();
                App.myProfile.year = seekers[6].toNumber();
                App.myProfile.DoW = seekers[7].toNumber();
                App.myProfile.salary = seekers[8].toNumber();
              }

              App.seekerListArray.push(obj);
            })
          }

          setTimeout(function () {
            $('#loader').hide();
            $('#content').show();
            $('#content').empty();

            console.log(App.myProfile);

            let str = '';
            str += '<div id="accountHolder" class="accountsDiv">Your Account: <a href="https://rinkeby.etherscan.io/address/' + App.account + '" target="_blank">' + App.account + '</a></div>';
            str += '<table border="0" width="99.99%">';
            // Row 1
            str += '<tr><th colspan="2">You are:</th></tr>';
            // Row 2
            str += '<tr><td width="50%" align="right">';
            if (App.myProfile.AccountType == 0) {
              str += '<img src="images/select_o.png">';
            } else {
              str += '<img src="images/select_x.png">';
            }
            str += '</td><td width="50%" align="left"><p>Job Seeker</p></td></tr>';
            // Row 3
            str += '<tr><td width="50%" align="right">';
            if (App.myProfile.AccountType == 1) {
              str += '<img src="images/select_o.png">';
            } else {
              str += '<img src="images/select_x.png">';
            }
            str += '</td><td width="50%" align="left"><p>Recruiter</p></td></tr>';
            // Row 4 | <hr/>
            str += '<tr><td colspan="2"><hr/></td></tr>';
            // Row 5 | name
            str += '<tr><td colspan="2"><p>You name: ' + App.myProfile.name + '</p></td></tr>';
            // Row 6 | <hr/>
            str += '<tr><td colspan="2"><hr/></td></tr>';
            // Row 7 
            str += '<tr><th colspan="2">Expertise:</th></tr>';
            // 8 
            str += '<tr><td width="50%" align="right">';
            str += '<img src="images/select_' + (App.myProfile.ExpertiseType == 0 ? 'o' : 'x') + '.png">';
            str += '</td><td width="50%" align="left"><p>Engineer</p></td></tr>';
            // 9
            str += '<tr><td width="50%" align="right">';
            str += '<img src="images/select_' + (App.myProfile.ExpertiseType == 1 ? 'o' : 'x') + '.png">';
            str += '</td><td width="50%" align="left"><p>Graphic Designer</p></td></tr>';
            // 10
            str += '<tr><td width="50%" align="right">';
            str += '<img src="images/select_' + (App.myProfile.ExpertiseType == 2 ? 'o' : 'x') + '.png">';
            str += '</td><td width="50%" align="left"><p>Web Developer</p></td></tr>';
            // 11
            str += '<tr><td width="50%" align="right">';
            str += '<img src="images/select_' + (App.myProfile.ExpertiseType == 3 ? 'o' : 'x') + '.png">';
            str += '</td><td width="50%" align="left"><p>Driver</p></td></tr>';
            // 12
            str += '<tr><td width="50%" align="right">';
            str += '<img src="images/select_' + (App.myProfile.ExpertiseType == 4 ? 'o' : 'x') + '.png">';
            str += '</td><td width="50%" align="left"><p>Manager</p></td></tr>';
            // 13
            str += '<tr><td colspan="2"><hr/></td></tr>';

            if (App.myProfile.AccountType == 1) {
              // 17
              str += '<tr><th colspan="2">Needs:</th></tr>';
              str += '<tr><td colspan="2">Monthly Salary: ' + App.myProfile.salary + '</td></tr>';
              str += '<tr><td colspan="2"><hr/></td></tr>';
            }

            // 14
            str += '<tr><th colspan="2">Abilities:</th></tr>';
            str += '<tr><td colspan="2">Experience Years: ' + App.myProfile.year + '</td></tr>';
            str += '<tr><td colspan="2">Working days/week: ' + App.myProfile.DoW + '</td></tr>';

            if (App.myProfile.AccountType == 0) {
              // 17
              str += '<tr><td colspan="2"><hr/></td></tr>';
              str += '<tr><th colspan="2">Needs:</th></tr>';
              str += '<tr><td colspan="2">Monthly Salary: $' + App.myProfile.salary + '</td></tr>';
            }

            ///////////////////////////////

            let match = new Array();
            let str2 = '';

            App.seekerListArray.sort(function (a, b) {
              return parseFloat(b.salary) - parseFloat(a.salary); // Decending
              //return parseFloat(a.salary) - parseFloat(b.salary); // Assending
            });

            for (let j = 0; j < App.seekerListArray.length; j++) {

              let lookForAccountType = App.myProfile.AccountType == 0 ? 1 : 0;
              //console.log(j, App.seekerListArray[j].name, "Acc", App.seekerListArray[j].AccountType, "Exp", App.seekerListArray[j].ExpertiseType)
              if (lookForAccountType == App.seekerListArray[j].AccountType && App.myProfile.ExpertiseType == App.seekerListArray[j].ExpertiseType) {
                match.push(App.seekerListArray[j]);
                
                if(App.myProfile.AccountType == 1){
                  let rank = 0;
                  for (let k = 0; k < App.seekerListArray.length; k++) {
                    //
                    if (App.seekerListArray[k].AccountType == 1 && App.myProfile.ExpertiseType == App.seekerListArray[k].ExpertiseType) {
                      //console.log(k, App.seekerListArray[j].name, "");
                      if(App.account == App.seekerListArray[k].address){
                        if (rank < 2){
                          str2 += '<tr><td colspan="2">You are top 2 of '+App.seekerListArray[j].name+' possible list.</td></tr>'
                        }else{
                          str2 += '<tr><td colspan="2">You out top 2 of '+App.seekerListArray[j].name+' possible list.</td></tr>'
                        }
                      }
                      
                      rank++;
                    }
                  }
                  //console.log("==================");
                }

                str2 += '<tr><td colspan="2"><table border="0" width="80%" align="center">';
                str2 += '<tr> <td width="300">Comparision:</td> <td>You</td> <td>&nbsp;</td> <td>' + App.seekerListArray[j].name + '</td> </tr>';
                str2 += '<tr> <td width="300">Experience year:</td> <td>' + App.myProfile.year + '</td> <td>' + App.ReturnGreateThenLessThen(parseInt(App.myProfile.year), parseInt(App.seekerListArray[j].year)) + '</td> <td>' + App.seekerListArray[j].year + '</td> </tr>';
                str2 += '<tr> <td width="300">Working days/week:</td> <td>' + App.myProfile.DoW + '</td> <td>' + App.ReturnGreateThenLessThen(parseInt(App.myProfile.DoW), parseInt(App.seekerListArray[j].DoW)) + '</td> <td>' + App.seekerListArray[j].DoW + '</td> </tr>';
                str2 += '<tr> <td width="300">Monthly Salary $</td> <td>' + App.myProfile.salary + '</td> <td>' + App.ReturnGreateThenLessThen(parseInt(App.myProfile.salary), parseInt(App.seekerListArray[j].salary)) + '</td> <td>' + App.seekerListArray[j].salary + '</td> </tr>';
                str2 += '</table></td></tr>';
                str2 += '<tr><td colspan="2"><hr/></td></tr>';

              }



            }



            if (match.length > 0) {
              str += '<tr><td colspan="2"><hr/></td></tr>';
              str += '<tr><th colspan="2">Report found ' + match.length + ' ' + (App.myProfile.AccountType == 0 ? 'recruiter' : 'candidate') + '</th></tr>';
              str += str2;

            }

            /////////////////////////////////////


            // END
            str += '</table>'

            $('#content').html(str);
            //$('#accountHolder').html('Your account : ' + App.account);

            for (let j = 0; j < App.seekerListArray.length; j++) {
              //console.log(App.seekerListArray[j].name);



            }



          }, 4000);


        }).catch((err) => {
          console.log("Error loading job index.", err.message)
        })
      } else {
        $('#loader').hide();
        $('#content').show();
        $('#content').empty();
        $('#content').load('signup.html', function () {
          //App.myProfile
          $('#accountHolder').html('Your Account: <a href="https://rinkeby.etherscan.io/address/' + App.account + '" target="_blank">' + App.account + '</a>');

        })
      }
    }).catch((err) => {
      console.log("call seekers", err.message);
    })
  },

  SignUpRequest: function () {
    const AccountType = parseInt($('#youare').find(':selected').val());
    const name = $('#name').val();
    const ExpertiseType = parseInt($('#expertisetype').find(':selected').val());
    const ExperiancYear = parseInt($('#years').val())
    const WorkingDays = parseInt($('#days').val())
    const Salarys = parseInt($('#salary').val())

    if (name && !isNaN(ExperiancYear) && !isNaN(WorkingDays) && !isNaN(Salarys)) {
      $('#loader').show();
      $('#content').hide();
      //console.log("AccountType:", AccountType, "Name", name, "ExpertiseType", ExpertiseType, "Experianc Year:", ExperiancYear, "WorkingDays", WorkingDays, "Salarys", Salarys);
      App.contracts.Jobs.deployed().then(function (instance) {
        JobsInstance = instance;
        return JobsInstance.SignUp(AccountType, name, ExpertiseType, ExperiancYear, WorkingDays, Salarys, { from: App.account });
      }).then((receipt) => {
        console.log(receipt.tx);
        $('#loader').hide();
        $('#content').show();
        $('#content').empty();
        App.LoadLandingPage();
      }).catch((err) => {
        $('#loader').hide();
        $('#content').show();
        $('#error').empty();
        $('#error').html("Sign-Up request could not be processed. " + err.message);
        setTimeout(function () { $('#error').empty(); }, 3000);
      })

    } else {
      //console.log("Fill up the sign up form correctly.");
      $('#error').empty();
      $('#error').html("Kindly, fill up the Sign up form correctly.");
      setTimeout(function () { $('#error').empty(); }, 3000);
      //LoadLandingPage
    }

    //JobsInstance
  },

  ReturnGreateThenLessThen: function (a, b) {
    let str = '=';
    if (a > b) {
      str = '>'
    }

    if (a < b) {
      str = '<'
    }

    return str;
  },

}

$(function () {
  $(window).load(function () {
    App.init();
  })
});
