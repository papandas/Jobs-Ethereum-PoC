pragma solidity ^0.4.23;

contract Jobs {

  enum AccountType {JobSeeker, Recruiter}

  enum ExpertiseType {Engineer, GraphicDesigner, WebDeveloper, Driver, Manager}

  struct Job{
    bool active;
    address addr;
    AccountType accType;
    string name;
    ExpertiseType expertise;
    uint256 year;
    uint256 DoW;
    uint256 salary;
  }

  mapping(address => Job) public jobs;

  address public owner;

  string public version = '0.0.1';

  constructor() public {
    owner = msg.sender;
  }

  function SignUp(AccountType _accType, string _name, ExpertiseType _expertise, uint256 _year, uint256 _Dow, uint256 _salary) public {
    require(jobs[msg.sender].active != true);

    jobs[msg.sender] = Job(true, msg.sender, _accType, _name, _expertise, _year, _Dow, _salary);

  }

}
