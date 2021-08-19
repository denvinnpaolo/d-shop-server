const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv/config');

app.use(cors());
app.options("*", cors());

const api = process.env.API_URL;

// routes
const productsRouter = require('./routes/products.js');
const ordersRouter = require('./routes/orders.js');
const categoriesRouter = require('./routes/categories.js');
const usersRouter = require('./routes/users.js');

// helpers
const authJwt = require('./helpers/jwt.js');
const errorHandler = require('./helpers/error-handler.js')

// middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler)

// Routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))


mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Database connection is ready');
    })
    .catch(err => {
        console.log(err);
    })
    
app.listen(3000, () => {
    console.log("Listening to port: 3000");
}); 