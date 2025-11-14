import mongoose from 'mongoose';
import Home from '../models/home.model.js';
import { connectDB } from "./db.js";
import { API_KEY_CRYPTOCOMPARE } from '../src/config.js';



export const getCrytoPrice=async()=>{


const baseUrl = 'https://data-api.coindesk.com/spot/v1/latest/tick';
const params = {
    "market":"binance",
    "instruments":"BTC-USDT,ETH-USDT,TON-USDT","apply_mapping":"true",
    "api_key":API_KEY_CRYPTOCOMPARE};
const url = new URL(baseUrl);
url.search = new URLSearchParams(params).toString();

const options = {
    method: 'GET',
    headers:  {"Content-type":"application/json; charset=UTF-8"},
};



fetch(url, options)
    .then((response) => response.json())
    .then((json) => {


        console.log("BITCOIN: ",json.Data['BTC-USDT'].PRICE , '% ', json.Data['BTC-USDT'].CURRENT_HOUR_CHANGE_PERCENTAGE);
        console.log("ETHEREUM: ",json.Data['ETH-USDT'].PRICE , '% ', json.Data['ETH-USDT'].CURRENT_HOUR_CHANGE_PERCENTAGE);
        console.log("TONCOIN: ",json.Data['TON-USDT'].PRICE , '% ', json.Data['TON-USDT'].CURRENT_HOUR_CHANGE_PERCENTAGE); 
    })
    .catch((err) => console.log(err));
} 

getCrytoPrice();