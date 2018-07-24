
var Jobs = artifacts.require("./Jobs.sol");


contract('Jobs Ethereum POC', function (accounts) {

    it("Init project test.", function () {
        return Jobs.deployed().then(function (instance) {
            JobsInstance = instance;
            return JobsInstance.version();
        }).then((version) => {
            console.log(version);
        });
        
    });

});

/*

.then(()=>{
            
        })
*/