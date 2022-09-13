README

This project contains the DUBS ERC20 token, as well as the vesting contract code,
as well as scripts and tools for deploying it.

ERC20 Token details:
Symbol: DUBS
Decimals: 18
Total Supply: 3.5bn
Max Supply: 3.5bn

After deploying, the entire supply will be minted and temporarily sent to a vesting contract.

In order to configure the vesting contract, a number of steps must be taken. They are as follows:

1. Feed in a list of permitted wallet addresses. These will be the ONLY addresses that vesting schedule events will be able to send funds to.
2. A script will be run which will load a CSV containing the vesting schedule. Below is an example showing the funds to be available immediately after the specified start time (month 0)

`Month	Address	Amount
0	0x00000000000000000000000000000	0.00
0	0x00000000000000000000000000001	0.00
0	0x00000000000000000000000000002	0.00
0	0x00000000000000000000000000003	30000000.00
0	0x00000000000000000000000000004	17500000.00
0	0x00000000000000000000000000005	4900000.00
0	0x00000000000000000000000000006	36750000.00
0	0x00000000000000000000000000007	4200000.00
0	0x00000000000000000000000000008	30277777.78
0	0x00000000000000000000000000009	0.00
0	0x00000000000000000000000000010	0.00
0	0x00000000000000000000000000011	0.00
`

Vesting Schedule Events have the following structure:
`
    struct VestingScheduleEvent {
        uint month;
        address destinationAddress;
        uint amount;
        bool hasRun;
    }
`ya

After the vesting contract has been configured and validated, it will be frozen and the entire supply will be sent there. No further changes to the vesting schedule will be permitted after freezing.

Any vesting events containing addresses that are NOT whitelisted MUST fail. Attempting to add a vesting event after the schedule has been frozen MUST fail.

Only the owner of the vesting contract will be able to add vesting events, or call the monthly withdrawal function. The monthly withdrawal function MUST fail if the schedule has not been frozen.

When calling the monthly withdrawal function, the month to run must be specified. In order to calculate if a monthly withdrawal is runnable, the following calculation is used:

`
 require(
 			block.timestamp >= startTime + vestingScheduleEvents[i].month * monthLengthDays,
            "The specified month's vesting events may not be run yet"
);
`

For the purposes of this contract, we specify the length of a month as being 28 days. This is hard coded at a contract level and cannot be configured after it has been deployed for security purposes.


The monthly withdrawal function can be set up to execute automatically on the same day every month (i.e. 1st) using a NodeJS script.

Security considerations:
Even somebody who has the private key for the deployment contract is unable to withdraw funds (ERC20 or MATIC) from the contract address. This is intentional and by design. Once it has been frozen, the schedule is completely immutable. I recommend us setting up a micro Amazon EC2 server (roughly $10/pm) for the purposes of running the monthly withdrawal script and any reporting. In the worst case scenario, even if somebody managed to get the private key they would not be able to take the funds from the contract or change the contract in any meaningful way.

