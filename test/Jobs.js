
var Jobs = artifacts.require("./Jobs.sol");


contract('Jobs Ethereum POC', function (accounts) {

    const jobseeker1 = accounts[0];
    const jobseeker2 = accounts[1];
    const jobseeker3 = accounts[2];
    const jobseeker4 = accounts[3];
    const jobseeker5 = accounts[4];

    const recruiter1 = accounts[5];
    const recruiter2 = accounts[6];
    const recruiter3 = accounts[7];
    const recruiter4 = accounts[8];
    const recruiter5 = accounts[9];

    it("Init project test.", function () {
        return Jobs.deployed().then(function (instance) {
            JobsInstance = instance;
            return JobsInstance.version();
        }).then((version) => {
            assert.equal(version, '0.0.1', 'Version is correct');
        });
    });


    it("Add Accounts.", function () {
        return Jobs.deployed().then(function (instance) {
            JobsInstance = instance;
            return JobsInstance.SignUp(0, "A", 1, 6, 5, 1000, {from: jobseeker1});
        }).then((receipt) => {
            console.log(receipt);
            return JobsInstance.jobs(jobseeker1);
        }).then((jobseeker)=>{
            console.log(jobseeker);
        });
    });

});

/*

.then(()=>{
            
        })
*/