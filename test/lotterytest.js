const Lottery = artifacts.require("Lottery");

contract('Token transfer', async (accounts) => {

  it("allow one account to enter", async () => {
    let account_one = accounts[0];

    let instance = await Lottery.deployed();
    
    await instance.enterLottery({
      from: account_one,
      value: web3.toWei('0.02', 'ether')
    })

    const players = await instance.getParticipants({
      from: account_one
    });
    assert.equal(1,players.length," Accounts number is invalid ");
  });

  it("allow two account to enter", async () => {
    let account_one = accounts[0];
    let account_two = accounts[1];
    let account_three = accounts[2];

    let instance = await Lottery.deployed();

    await instance.enterLottery({
      from: account_two,
      value: web3.toWei('0.02', 'ether')
    })

    await instance.enterLottery({
      from: account_three,
      value: web3.toWei('0.02', 'ether')
    })

    const players = await instance.getParticipants({
      from: account_one
    });

    assert.equal(3,players.length,"Accounts number is invalid ");
    assert.equal(account_one,players[0],"Player account 1 is invalid");
    assert.equal(account_two,players[1],"Player account 2 is invalid");
    assert.equal(account_three,players[2],"Player account 3 is invalid");
  });

  it("requires a minimum amount of ether to enter", async () => {
    let account_one = accounts[0];
    let instance = await Lottery.deployed();

    try {
      await instance.enterLottery({
        from: account_one,
        value: web3.toWei('0', 'ether')
      })
      console.log('Yes');
      assert(false);
    } catch (error) {
      console.log('No');
      assert(error);
    }
  });

  it("requires the owner to pick a winner", async () => {

    let instance = await Lottery.deployed();

    try {
      await instance.pickWinner({
        from: account[1]
      })
      assert(false);
    } catch(error) {
      assert(error);
    } 
  })
})