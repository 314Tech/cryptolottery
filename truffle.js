module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    }
  },
  rinkeby: {
    host: "localhost", // Connect to geth on the specified
    port: 8545,
    from: "0xD509b640Bb9E6DB6222359715C9aF333ed69b666", // default address to use for any transaction Truffle makes during migrations
    network_id: 4,
    gas: 4612388 // Gas limit used for deploys
  }
};
