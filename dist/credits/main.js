const Url = "https://diadem.host/credits"

window.transferCredits = function transferCredits(options, callback) {
  const code = 'CS'

  const Client = SignCS.Connect()

  const transaction = SignCS.ConstructTransaction(Client, {
    currency: 1,
    fee: 0.1,
    amount: options.amount,
    source: options.publicKey,
    Priv: options.privateKey,
    target: options.address
  })

  Client.TransactionFlow(transaction, (result) => {
    callback(null, result)
  })
}

window.getCreditsBalance = function getCreditsBalance(publicKey, callback) {
  const Client = SignCS.Connect()

  Client.WalletBalanceGet(publicKey, (result) => {
    callback(null, result)
  })
}
