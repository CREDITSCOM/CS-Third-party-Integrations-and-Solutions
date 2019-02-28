# InventoryCS

Entry for the [Credits online-hackathon](https://opengift.io/credits-hackathon/).

InventoryCS is a dApp developed on the [Credits](https://www.credits.com) blockchain.
Credits is the fastest and most scalable public blockchain platform for development and execution of Decentralized Applications based on blockchain technology in a number of application spheres. It is the first platform to solve blockchain scalability problem without compromising two other components: security and decentralization.

The Credits platform is characterized by the following features:
- High transaction processing speed - more than 1 million transactions per second;
- The minimum transaction processing time is from 0.01 seconds per transaction;
- Very low price - a differentiated rate from about 0.001 USD;
- Smart contracts that have new advanced capabilities and tools.

The combination of InventorCS with the Credits blockchain offers the following:
- High secured inventory data. All data is carried out on the Credits blockchain, making it impossible to forge data;
- Decentralization: the inventory is not controlled by a single entity;
- Tracking: in the process of managing the inventory, the data is checked and verified at every checkpoint;
- Accuracy: the loss of data will not be a problem as the data is spread accros the public ledger.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Requirements

Requirements to run this dApp

```
- Internet browser (Chrome or Firefox recommended).
- Internet connection.
- Access to a Credits node.
- Have access to a wallet on the Credits network with some balance.
```

### Installing

To run this dApp locally, you need to download a copy from github first.
Extract files to a self-chosen location.
Open index.html.
For test purposes it is possible to change the ip and port of the node you want to connect to. The default is the node ip and port given by the Credits team.
You're good to go.

### Online version

Available on [http://timok93.22web.org/](http://timok93.22web.org/)

### Functions MVP version

- Logging into the dApp with your public and private key by:
  - Entering them manually;
  - Selecting a keyfile on your system;
  - Drag your keyfile into the drop zone;
  - Generating a new keypair.
- Select inventory smart contract.
- Deploy new smart contract.
- Add/edit/delete products.
- Enter changelist mode to save multiple changes in one click.
- Sort products on ID, description or quantity.

## Compatibility

This dApp is created on testnet 3.4. Might not work for newer versions of the [Credits](https;//www.credits.com) testnet which are expected. In case it does not work with a new release, I will post an update as soon as possible.

Small screen devices are not yet supported.

## Future updates
- The possibility to enter more details of products, such as order quantity, supplier, minimum quantity.
- Automatically order products at supplier when products reach a minimum level set by user.
- Giving suppliers access to your smart contract by entering their public key when setting up suppliers.
- Suppliers can check which products are below minimum quantity and set status of product to 'ordered'.
