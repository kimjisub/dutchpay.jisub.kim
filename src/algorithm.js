export function calcExpenditure(data) {
  let ret = {};

  for (let id in data.members)
      ret[id] = {spend: 0, paied: 0}

    console.log(ret)

  for (let i in data.receipts) {
    let receipt = data.receipts[i];

    let totalPrice = 0
    for(let j in receipt.items){
        let item = receipt.items[j]
        let price = item.price
        let eachPrice = price / (item.buyers.length)
        totalPrice += price

        for(let k in item.buyers){
            let id = item.buyers[k]
            ret[id].spend += eachPrice
        }
    }

    for(let j in receipt.payers){
        let id = receipt.payers[j].name
        let price = receipt.payers[j].price
        ret[id].paied += price
    }
  }

  return ret;
}
