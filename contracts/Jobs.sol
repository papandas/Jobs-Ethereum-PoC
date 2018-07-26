pragma solidity ^0.4.23;

contract Jobs {

  enum AccountType {JobSeeker, Recruiter}

  enum ExpertiseType {Engineer, GraphicDesigner, WebDeveloper, Driver, Manager}

  struct Job{
    uint256 index;
    bool active;
    address addr;
    AccountType accType;
    string name;
    ExpertiseType expertise;
    uint256 year;
    uint256 DoW;
    uint256 salary;
  }

  mapping(address => bool) public seekers;
  mapping(uint256 => Job) public jobs;

  uint256 public jobIndex;
  address public admin;
  string public version = '0.0.1';

  constructor() public {
    admin = msg.sender;
  }

  modifier isOwner() {
    if (msg.sender == admin) _;
  }

  function SignUp(AccountType _accType, string _name, ExpertiseType _expertise, uint256 _year, uint256 _Dow, uint256 _salary) public {
    require(!seekers[msg.sender]);

    jobIndex++;
    jobs[jobIndex] = Job(jobIndex, true, msg.sender, _accType, _name, _expertise, _year, _Dow, _salary);

    seekers[msg.sender] = true;
  }

  function UpdateJobs(uint256 index, AccountType _accType, string _name, ExpertiseType _expertise, uint256 _year, uint256 _Dow, uint256 _salary) public {
    //require(msg.sender == jobs[index].addr);

    jobs[index].accType = _accType;
    jobs[index].name = _name;
    jobs[index].expertise = _expertise;
    jobs[index].year = _year;
    jobs[index].DoW = _Dow;
    jobs[index].salary = _salary;

  }

   function ResetData() public isOwner returns(bool){

    for (uint i = 1; i<jobIndex; i++){
      delete seekers[jobs[i].addr];
      delete jobs[i];
    }

    jobIndex = 0;
    
    return true;

  }

}
