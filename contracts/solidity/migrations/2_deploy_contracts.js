const KeepToken = artifacts.require("./KeepToken.sol");
const TokenStaking = artifacts.require("./TokenStaking.sol");
const TokenGrant = artifacts.require("./TokenGrant.sol");
const KeepRandomBeaconImpl = artifacts.require("./KeepRandomBeaconImpl.sol");

const withdrawalDelay = 86400; // 1 day
const minKeepForStake = 1; 

module.exports = function(deployer) {
  deployer.deploy(KeepToken)
    .then(function() {
      return deployer.deploy(TokenStaking, KeepToken.address, withdrawalDelay)
		.then(function() {
		  return deployer.deploy(KeepRandomBeaconImpl, TokenStaking.address, minKeepForStake);
		});
    }).then(function() {
      return deployer.deploy(TokenGrant, KeepToken.address, withdrawalDelay);
    });
};
