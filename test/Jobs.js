
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

    // AccountType _accType, string _name, ExpertiseType _expertise, uint256 _year, uint256 _Dow, uint256 _salary
    it("Add Accounts.", function () {
        return Jobs.deployed().then(function (instance) {
            JobsInstance = instance;
            return JobsInstance.SignUp(0, "A", 1, 6, 5, 1000, {from: jobseeker1});
        }).then((receipt) => {
            return JobsInstance.SignUp(0, "B", 2, 7, 6, 800, {from: jobseeker2});
        }).then((receipt)=>{
            return JobsInstance.SignUp(0, "C", 3, 8, 5, 600, {from: jobseeker3});
        }).then((receipt)=>{
            return JobsInstance.SignUp(1, "D", 1, 9, 6, 400, {from: recruiter1});
        }).then((receipt)=>{
            return JobsInstance.SignUp(1, "E", 2, 10, 5, 200, {from: recruiter2});
        }).then((receipt)=>{
            return JobsInstance.SignUp(1, "F", 3, 11, 6, 1600, {from: recruiter3});
        }).then((receipt)=>{
            return JobsInstance.SignUp(1, "F", 3, 11, 6, 1600, {from: recruiter3});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
        })
    });

    it("Find all accounts.", function () {
        return Jobs.deployed().then(function (instance) {
            JobsInstance = instance;
            return JobsInstance.jobIndex();
        }).then((jobindex)=>{
            //console.log(jobindex);
            return JobsInstance.jobs(4);
        }).then((recruter)=>{
            console.log(recruter);
        })
    });

});

/*

.then(()=>{
            
        })
*/