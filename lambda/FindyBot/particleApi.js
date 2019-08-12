'use strict';

const axios = require('axios');

module.exports = class ParticleApi {
    constructor() {
        // todo - use custom client, short lived tokens, refresh token
        this.deviceId = process.env.PARTICLE_DEVICE;
        this.accessToken = process.env.PARTICLE_TOKEN;
    }

    async highlightItem(item) {
        const payload = {
            Command: "FindItem",
            Count: 1,
            Result: [{
                Name: item.name,
                Quantity: item.quantity,
                Row: item.row,
                Col: item.col
            }]
        };
        let payloadStr = JSON.stringify(payload);

        return this.publishEvent('Findybot_', payloadStr, true, 5);

    }


    async publishEvent(name, data, _private, ttl) {
        const endpoint = 'events';
        const payload = {
            name,
            data,
            private: _private,
            ttl
        };
        return this.post(endpoint, payload);
    }

    async callFunction(func, payload) {
        const endpoint = `${this.deviceId}/${func}`;
        return this.post(endpoint, {arg: payload});
    }


    async post(endpoint, payload) {
        if(!this.deviceId) {
            console.error('Device id is missing.');
        }
        if(!this.accessToken) {
            console.error('Access Token is missing.');
        }
        if(!this.deviceId || !this.accessToken) {
            return Promise.reject('Device ID or Access Token missing.');
        }

        const url = `https://api.particle.io/v1/devices/${endpoint}`;
        console.log(url)
        return axios({
            method: 'post',
            url,
            headers: {'Authorization': `Bearer ${this.accessToken}`},
            responseType: 'json',
            data: payload
        });
    }
      
}