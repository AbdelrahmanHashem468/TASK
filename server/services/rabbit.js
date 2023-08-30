const { client } = require('../libs');
const Producer = require('./producer');


function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

const saveMessageToRedis = async (data) => client.hset('notification', makeid(5), JSON.stringify(data));

const getAllMessageFromRedis = async () => await client.hgetall('notification');

const deleteFromRedis = async (id) => await client.hdel('notification',id);




module.exports = {
    saveMessageToRedis,
    getAllMessageFromRedis,
    deleteFromRedis
}