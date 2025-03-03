const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    fetchCustomers,
    fetchRestaurants,
    createReservations,
    fetchReservations,
    destroyReservations
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/customer', async(req, res, next)=> {
    try {
      res.send(await fetchCustomers());
    }
    catch(ex){
      next(ex);
    }
});

app.get('/api/restaurant', async(req, res, next)=> {
    try {
      res.send(await fetchRestaurants());
    }
    catch(ex){
      next(ex);
    }
});

app.get('/api/reservation', async(req, res, next)=> {
    try {
      res.send(await fetchReservations());
    }
    catch(ex){
      next(ex);
    }
});

app.delete('/api/customer/:customer_id/reservation/:id',  async(req, res, next)=> {
    try {
        await destroyReservations({customer_id: req.params.customer_id, id: req.params.id});
        res.sendStatus(204);
    }
    catch(ex){
        next(ex);
    }
});

const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('created tables');
    const [moe, lucy, larry, ethyl, mcdonalds, burger_king, taco_bell] = await Promise.all([
        createCustomer('moe'),
        createCustomer('lucy'),
        createCustomer('larry'),
        createCustomer('ethyl'),
        createRestaurant('mcdonalds'),
        createRestaurant('burger king'),
        createRestaurant('taco bell'),
    ]);
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());

    const [reservation, reservation2] = await Promise.all([
        createReservations({
            customer_id: moe.id,
            restaurant_id: taco_bell.id,
            date: '02/14/2024',
            party_count: 5
        }),
        createReservations({
            customer_id: moe.id,
            restaurant_id: taco_bell.id,
            date: '02/28/2024',
            party_count: 8
        }),
    ]);

    console.log(await fetchReservations());
    await destroyReservations({ id: reservation.id, customer_id: reservation.customer_id});
    console.log(await fetchReservations());

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log('some curl commands to test');
        console.log(`curl localhost:${port}/api/customer`);
        console.log(`curl localhost:${port}/api/restaurant`);
        console.log(`curl localhost:${port}/api/reservation`);
        console.log(`curl -X DELETE localhost:${port}/api/customer/${moe.id}/reservation/${reservation2.id}`);
     });
};

init();