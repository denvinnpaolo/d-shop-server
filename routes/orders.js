const {Order} = require('../models/order.js')
const {OrderItem} = require('../models/order-item.js')
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const orderList = await (Order.find().populate('user', 'name'));

    if (!orderList) {
        res.status(500).json({success: false})
    }
    res.status(200).json(orderList)
});

router.get('/:id',(req, res) => {
    console.log(req.params.id)

 
    Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    })
        .then(order => {
            res.status(200).json(order)
        })
        .catch(err => {
            res.status(500).json({error: err})
        })

});


router.post('/', async (req, res) => {
    const orderItemsIds = await Promise.all(req.body.orderItems.map((item) => {
        let newOrderItem = new OrderItem({
            quantity: item.quantity,
            product: item.product
        });

        newOrderItem.save()

        return newOrderItem._id;
    }));


    const totalPrices = await Promise.all(orderItemsIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }));

    const totalPrice = totalPrices.reduce((a,b) => a+b, 0);


    const order = new Order({
        orderItems: orderItemsIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    });

    order.save()
        .then(order => {
            if (order === undefined) {
                res.status(400).json({message: 'order cannot be processed'})
             } else {
                 res.status(201).json(order)
             }
        })
        .catch(err => res.status(500).json({error: err, message: 'server error'}))
});

router.put('/:id', (req, res) => {
    Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true}   
    )
        .then(order => {
            res.status(200).json(order)
        })
        .catch(err => {
            res.status(500).json({
                error: err,
                message: 'Server Error' 
            })
        });
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(removed => {
            const removedItemList = []
            removed.orderItems.map(orderItem => {
                OrderItem.findByIdAndRemove(orderItem)
                    .then(removedOrderItem => {
                        removedItemList.push(removedOrderItem)
                    })
            })
            res.status(200).json({
                removedOrder: removed,
                removedOrderItems: removedItemList
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err,
                message: 'Internal Server Error'
            })
        });
});


router.get('/get/totalsales',(req, res) => {
    Order.aggregate([
        { $group: {_id: null, totalSales : { $sum : '$totalPrice'}}}
    ])
        .then(total => {
            res.status(200).json({totalSales: total.pop().totalSales})
        })
        .catch(err => {
            res.status(500).json({
                error: err,
                message: "The order sales cannot be generated"
            })
        })
});

router.get('/get/count', (req, res) => {
    Order.countDocuments(count => count)
        .then(count => {
            res.status(200).json({count: count});
        })
        .catch(err => res.status(500).json({message: 'cannot get count'}))
});


router.get('/get/userorders/:userid', async (req, res) => {
    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({'dateOrdered': -1})
        .then(userOrders => {
            res.status(200).json(userOrders)
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
});


module.exports = router;

