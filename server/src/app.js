import express from 'express'
import morgan from "morgan"
import getRoutes from '../routes/get.routes.js'

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended: true,limit: '50mb'})); 
app.use(express.json({limit: '50mb'})); 

app.use('/api', getRoutes)

export default app