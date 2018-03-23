'use strict'
const Ticket = artifacts.require("./Ticket.sol")

contract('test', function(accounts) {
  const admin = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[2]
  const user3 = accounts[3]
  const wallet = accounts[4]
  const PRICE = Number(web3.toWei(0.25, "ether"))
  const dust = Number(web3.toWei(0.1, "ether"))

  const balanceOf = async function (address) {
    return await web3.eth.getBalance(address)
  }

  it("go through all steps", async function() {
    var ticket = await Ticket.new(wallet, {from: admin})
    var totalSupply = await ticket.totalSupply.call()

    // user1 get the ticket throught fallback function 
    await web3.eth.sendTransaction({from: user1, to: ticket.address, value: PRICE})

    // user2 get the ticket, more than DEPOSIT would be see as donate
    await ticket.getTicket(user2, {from: user2, value: PRICE + dust})

    // user3 get the ticket
    await web3.eth.sendTransaction({from: user3, to: ticket.address, value: 3 * PRICE + dust})

    // check ticket contract balance
    var totalSupply2 = await ticket.totalSupply.call()
    var balance1 = await ticket.balanceOf.call(user1)
    var balance2 = await ticket.balanceOf.call(user2)
    var balance3 = await ticket.balanceOf.call(user3)
    assert.equal(totalSupply2 - totalSupply, 5 )
    assert.equal(balance1, 1)
    assert.equal(balance2, 1)
    assert.equal(balance3, 3)
    
    // check token trnasfer 
    await ticket.transfer(user2, 1, {from: user1});
    balance1 = await ticket.balanceOf.call(user1)
    balance2 = await ticket.balanceOf.call(user2)
    assert.equal(balance1, 0)
    assert.equal(balance2, 2)

    // close the sell
    await ticket.close({from: wallet});
    try {
      await ticket.getTicket(user1, {from: user1, value: PRICE})
      assert.fail('Expected revert not received')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0 || error.message.search('assert') >= 0
      assert(revertFound, `Expected "revert", got ${error} instead`)
    }  
  });
});
