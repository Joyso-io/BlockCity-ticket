pragma solidity ^0.4.19;
import "./token/StandardToken.sol";


contract Ticket is StandardToken {
    string constant public name = "BlockCity";
    string constant public symbol = "BCITY";
    uint8 constant public decimals = 0;
    uint256 constant public price = 0.25 ether;
    uint256 constant public MAX = 300;
    bool public isEnd = false;
    address public wallet;

    function Ticket (address _wallet) public {
        wallet = _wallet;
    }

    function () public payable {
        getTicket(msg.sender);
    }

    function getTicket(address beneficiary) public payable {
        require (!isEnd);
        require (beneficiary != address(0));
        require (totalSupply < MAX);
        uint256 amount = msg.value / price;
        balances[beneficiary] += amount;
        totalSupply += amount;
        wallet.transfer(amount * price);
        msg.sender.transfer(msg.value - amount * price);
    }

    function close() external {
        require (msg.sender == wallet);
        isEnd = true;
    }
}
