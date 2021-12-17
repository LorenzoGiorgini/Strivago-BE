import mongoose  from "mongoose";
import server from "./server"


process.env.TS_NODE_DEV && require("dotenv").config();

const port = process.env.PORT || 3001

mongoose.connect(process.env.MONGO_CONNECTION!)
.then(() => {
    console.log(`Connected to Mongo`);
    server.listen(port, () => {
        
        console.log(`Server is running on port ${port}`);
    })
})