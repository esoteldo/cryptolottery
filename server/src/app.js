import express from 'express'
import morgan from "morgan"
import cors from "cors"
import getRoutes from '../routes/get.routes.js'

const app = express()

app.use(cors())
app.use(morgan("dev"))
app.use(express.json({limit: '10mb'}))
app.use(express.urlencoded({extended: true, limit: '10mb'}))

app.use('/api', getRoutes)

export default app