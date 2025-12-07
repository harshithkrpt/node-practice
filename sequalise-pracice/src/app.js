import express from 'express';
import userRoute from './routes/v1/user.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use("/server/v1/user", userRoute);



export default app;