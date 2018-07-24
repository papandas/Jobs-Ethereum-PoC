# Jobs-Ethereum-PoC
Do basic tasks to find similarities between job seekers and employers



# Project Description
create a smart-contract like the example on solidity page https://solidity.readthedocs.io/en/v0.4.24/solidity-by-example.html#blind-auction

And can do basic tasks to find similarities between job seekers and employers

In detail, when run smart contract, a node can declare it as recruiter or job-seeker. Recruiter or Job-seeker both have 2 attributes : ‘Abilities’ and ‘Needs’

If as Job seeker, ‘Abilities’ include:<expertise>, <experience years,> <number of past companies>. ‘Needs’ include: <salary>

As Recruiter, above attributes are swapped, ‘Abilities’: <salary> may be paid. ‘Need’ informations : <expertise>, <experience years>, <number of past companies>

Smart contract will do the comparison for each node that’s running it. when a recruiter-node encounters job-seeker-node that have the same <expertise> , ‘Ability’ of this node will be compared with ‘Need’ of other node and vice-versa. Then report the difference of attributes between each node, e.g the <salary> in ‘Ability’ of recruiter-node is lower than <salary> in ‘Need’ of job-seeker-node, ect.

When a recruiter-node(or a job-seeker-node) encounters the node like itself , smart-contract will ignore the comparison, continue ignoring when a recruiter-node encounters job-seeker-node but not same <expertise> ( e.g engineers vs graphic ) the report in jobseeker must be sorted by higher payer And the recruiter node which in or out of ‘top 2’ of that report will be notified the final result can be presented as https://medium.com/@merunasgrincalaitis/the-ultimate-end-to-end-tutorial-to-create-and-deploy-a-fully-descentralized-dapp-in-ethereum-18f0cf6d7e0e