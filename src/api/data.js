import axios from './axios'

const API="http://localhost:3000/api"

export const ticketBuyed=async(data)=> axios.post(`${API}/ticket`,data)

export const getInitData=async(id)=> axios.get(`${API}/getinitdata/${id}`)





