## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```bash
forge build
```

> Note: ABI interface contract information may be found via
> `out/I<NAME>.sol/I<NAME>.json` naming conventions, ex;
>
> - `out/IZorpFactory.sol/out/IZorpFactory.json`
> - `out/IZorpStudy.sol/out/IZorpStudy.json`
>
> ...  These often are significantly fewer bytes to serve to third-party
> clients, and often load/parse faster within off-chain libraries.

### Test

- Run all tests
   ```bash
   forge test
   ```
- Run specific test file
   ```bash
   forge test --match-path test/ZorpFactory_Success.t.sol
   ```
- Run tests and gather coverage statistics, while ignoring `script/` and `test/` sub-directories
   ```bash
   forge coverage --no-match-coverage '(script|test)'
   ```
- Run tests and gather gas statistics
   ```bash
   forge test --gas-report
   ```

**Notes about testing philosophy**

- Test contracts will _mostly_ follow a naming convention of `<parent>_<topic>_<mutation>_Test`, ex `ZorpFactory_Revert_Write_Test` tests certain `Write` mutations will `Revert` for `ZorpFactory` parent
- All test functions must be independent, I.E. no shared or persistent state
- Test functions are generally ordered as they are defined within the contract being tested
- Test function names generally follow a pattern similar to `test_<action>__<name>__<description>`, and `__<description>` is optional when sufficiently self explanatory, ex. `test_write__setRefFactoryNext__rejects_when_previously_upgraded`
- Code within test functions are generally ordered as; `<setup>`, `<execute>`, then `<assert>`
- Assertions of values are generally ordered as; `<expected>`, `<got>`, then `<message>`
- Assertions of events ordered as; `<listener>`, `<expected>`, then `<execute>`
- Assertions of error ordered as; `<listener>`, `<expected>`, then `<execute>`

**Useful test writing resources**

- [Foundry -- Cheetcodes -- `expectEmit`](https://book.getfoundry.sh/cheatcodes/expect-emit)
- [Foundry -- Cheetcodes -- `expectRevert`](https://book.getfoundry.sh/cheatcodes/expect-revert)

### Format

```bash
forge fmt
```

### Gas Snapshots

```bash
forge snapshot
```

### Anvil

```bash
anvil
```

### Deploy

```bash
forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Mock

Start local dev-net;

```bash
anvil --host 127.0.0.1
```

> Note; if running in Docker, or other container/verbalization solution, then
> adjusting firewall rules and/or port forwarding may be necessary to allow
> end-to-end testing.

Within a separate terminal session publish a contract to the local dev-net;

```bash
_test_net_url='127.0.0.1:8545'
_test_private_key0='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
_initialOwner='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

#### Dry run
forge create \
  --rpc-url "${_test_net_url}" \
  --private-key "${_test_private_key0}" \
  src/ZorpFactory.sol:ZorpFactory \
  --constructor-args "${_initialOwner}"

#### Actually broadcast
forge create \
  --broadcast \
  --rpc-url "${_test_net_url}" \
  --private-key "${_test_private_key0}" \
  src/ZorpFactory.sol:ZorpFactory \
  --constructor-args "${_initialOwner}"
```

**Example result**

```
No files changed, compilation skipped
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Transaction hash: 0x0eab52efa60b06c9e0a56a0c1c816b755ec75d7cca16635d2f929e40874ff38b
```

### Cast

Syntax;

```
cast <subcommand>
```

Provided a local dev-net is running, such as via `anvil`, try getting contract
information via;

```bash
_test_net_url='127.0.0.1:8545'
_zorp_factory_address='0x5FbDB2315678afecb367f032d93F642f64180aa3'

cast call "${_zorp_factory_address}" "owner()(address)" --rpc-url "${_test_net_url}"
```

**Example reply**

```
0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
```

### Help

```bash
forge --help
anvil --help
cast --help
```

## Privacy

Most public blockchains are **not** private, or anonyms, and the best anyone can realistically hope for is pseudonymity!

For this project in particular that means; calling an instance of `ZorpStudy.submitData(string)` (and/or any other function that mutates on-chain state) will record **publicly** the account submitting the and, ever more, allow anyone to associate past and future transactions with the data submitted.

Two key technologies are recommended to mitigate privacy risks; off-chain encryption of data via PGP, and on-chain mixer/tumbler.

### On-chain mixer or tumbler

This project, for reasons, may not be able to provide up-to-date instructions and/or suggestions on what crypto mixer/tumbler is best to use.  Current state-of-the-art are non-custodial systems that leverage [ZK Proofs][wikipedia__non_interactive_zero_knowledge_proof] with fixed currency amounts for deposit/withdraw, and waiting some amount of time between deposit and withdraw actions.

At a high-level the following steps are what can be expected to mitigate privacy risks;

0. Generate a **private** note and deposit funds into a pool
1. **Wait** some amount of time, longer the better
2. Withdraw funds to a **different** account using private note
3. Use account withdraw to **only** for intended actions, eg. `ZorpStudy.submitData(string)` and `ZorpStudy.claimReward()`

...  Later, to withdraw funds accumulated via `ZorpStudy.claimReward()`, use a similar set of steps to withdraw to an account intended for non-ZorpStudy related actions.

### Off-chain encryption via PGP / GPG

The `zorp-frontend/` provides endpoints which uses two public PGP encryption keys as recipients to encrypt data with, one provided by data submitter and the other from `ZorpStudy.owner()`, prior to attempting to submit that data to any network.

Creating a new PGP/GPG key-pair **only** for use with `ZorpStudy` contract interactions with little, to no meta-data, is recommended.  For example to create a new key-pair indented for use with a specific crypto-wallet;

```bash
#### Set your public wallet id within double-quotes
_wallet_id="0xDEADBEEF"

#### Copy/paste the whole block to test, then remove "--dry-run" to commit
GPG_TTY="$(tty)" gpg --dry-run --full-generate-key --batch <<EOF
Key-Type: ECDSA
Key-Curve: secp256k1
Subkey-Type: ECDH
Subkey-Curve: secp256k1
Name-Real: ZorpStudy
Name-Comment: Use to call ZorpStudy with submitData or claimReward functions
Name-Email: noreply+${_wallet_id}@example.com
Creation-Date: $(TZ=UTC date --date='00:00:00 UTC' +'%F')
Expire-Date: $(TZ=UTC date --date='00:00:00 UTC +2 years' +'%F')
EOF
```

> Tip: check [GnuPG -- 4.5.4 Unattended key generation][gnupg__unattended_gpg_key_generation] for more options

## Upgrades

New versions of `ZorpFactory` may be published with new features or fixes.  The `ZorpFactory.ref_factory_previous()(address)` and `ZorpFactory.ref_factory_next()(address)` view functions, like a doubly-linked list, point to previous and next versions of `ZorpFactory` contracts;

- When `ZorpFactory.ref_factory_previous()(address)` returns `address(0)`, then it may be assumed the current address is the **first** of its line.
- When `ZorpFactory.ref_factory_next()(address)` returns `address(0)`, then it may be assumed the current address is the **last** of its line.

Prior to calling `ZorpFactory.createStudy(address,string)` it is encouraged, but not required, to check for updates because each instance tracks it's own series of `ZorpStudy` contracts which may have feature/fix differences too.

> :warning: **No** `event` or `error` will be emitted/reverted by the blockchain if using an older version!



[gitfoundry__forge_create]: https://book.getfoundry.sh/reference/forge/forge-create
[gitfoundry__cast]: https://book.getfoundry.sh/cast/
[wikipedia__non_interactive_zero_knowledge_proof]: https://en.wikipedia.org/wiki/Non-interactive_zero-knowledge_proof
[gnupg__unattended_gpg_key_generation]: https://www.gnupg.org/documentation/manuals/gnupg-devel/Unattended-GPG-key-generation.html

