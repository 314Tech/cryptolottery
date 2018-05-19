This is a the mid-term assignment for the Siraj DApp class. Lottery is a simple lottery game contract that receives Ethers from participants and draws randomly one every hour. The winner wins the whole balance.

## Compile
Compile the contract using truffle
```
truffle compile
```

## Deploy
The contract can be deployed to a local network or the rinkeby test network

### Deploy with ganache

 1. Run Ganache
 2. Run the deployment script

```
./scripts/deploy.sh
```

### Deploy on the Rinkeby test network

 1. Run a rinkeby node
```
geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="0x0085f8e72391Ce4BB5ce47541C846d059399fA6c"
```
the --unlock option is your address

 2. modify the *truffle.js* file with your address (from):
```javascript
 rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0x0085f8e72391Ce4BB5ce47541C846d059399fA6c", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    }
```
 3. Run the deployment script

```
./scripts/deploy.sh -network rinkeby
```

 4. Install the packages
 ```
 npm install
 ```
 5. Run the React app
```
npm run start
```

Good Luck!