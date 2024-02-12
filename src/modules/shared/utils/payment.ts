import axios from 'axios';
import { IOrder } from "../../orders/interface/orders.interface";
import { PAYMENT } from "./../../../config/conf";


export async function createPaymentProduct(productId: string, order: IOrder) {
  let config = {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      "Authorization": `${PAYMENT.TEST_TRANSACTION_API_URL}:${PAYMENT.TEST_TRANSACTION_API_KEY}`
    }
  }


  let body =  {
    prices:[{"currency":"USD", "value":order.total_cost_amount}],
    payload:order.id,
  };

  let response = await axios.post(`${PAYMENT.TEST_TRANSACTION_URL}customize-product/${productId}`, body, config);  
  return response.data
}

export async function markAsProcessed(transactionId: string) {
  let config = {
    method: "POST",
    headers:{ 
      "Authorization": `${PAYMENT.TEST_TRANSACTION_API_URL}:${PAYMENT.TEST_TRANSACTION_API_KEY}`
    }
  } 

  let response = await axios.post(`${PAYMENT.TEST_TRANSACTION_URL}changed-transactions/${transactionId}`, {},config);  
 
  return response
}


