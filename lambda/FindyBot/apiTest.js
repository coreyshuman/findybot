const axios = require('axios');
const ParticleApi = require('./particleApi');

const particleApi = new ParticleApi();

console.log('send request');
const payload = {
    Command: "FindItem",
    Count: 1,
    Result: [{
        Name: 'battery',
        Quantity: 1,
        Row: 8,
        Col: 0
    }]
};
let payloadStr = JSON.stringify(payload);
console.log(payloadStr);
//payloadStr = '{Command: "Welcome", Message: "hello"}';
try {
    const res = particleApi.publishEvent('Findybot_', payloadStr, true, 5);
    console.log(res)
    res.then(a => {
        console.log(a.status);
        console.log(a.data);
    }).catch(e => {
        console.log(e.message)
        console.log(e.response.data)
    })
} catch(e) {
    console.error(e);
}
