import express from "express";
import cron from 'node-cron';

const app = express();

app.use(express.json());


cron.schedule('*/1 * * * *', (task) => {
    console.log(task);
    console.log("Task Executing Every Minute");
}, {
    timezone: 'Asia/Kolkata'
});

app.get("/health", (req, res) => {
    res.send({
        message: "OK"
    });
});

app.listen(3000, (err) => {
    if(!err) console.log("Server Started");
})