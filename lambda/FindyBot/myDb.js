const { Client } = require('pg');  //  Needs the nodePostgres Lambda Layer.

module.exports = class Database {
  constructor() {
    this.client = new Client();
    
  }

  async connect() {
    await this.client.connect();
    return this.client;
  }

  async findItem(itemName) {
    const query = "select name, quantity, row, col from findybot.items where namekey like $1::varchar;";
    const res = await this.client.query(query, [ itemName ]);
  
    if(res.rows && res.rows.count > 0) {
      return res.rows;
    } else {
      return null;
    }
  }

  async findConsumedBoxes() {
    const query = "select distinct row,col from findybot.items";
    const res = await this.client.query(query);
  
    if(res.rows && res.rows.count > 0) {
      return res.rows;
    } else {
      return null;
    }
  }

  async insertItem(itemName, itemCount, useSmallBox, row, col) {
    const query = 'insert into findybot.items ("namekey", "name", "quantity", "row", "col", "isSmallBox")' 
      + 'values($1::varchar, $2::varchar, $3::number, $4::number, $5::number, $6) returning id;';
    const res = await this.client.query(query, [itemName, itemCount, useSmallBox, row, col]);
    //await this.client.end();
    return res.rows[0].id;
  }

  async logQuery(requestBody) {
    const query = 'insert into findybot.httprequests ("httprequestbody") values($1::varchar) returning id;';
    const res = await this.client.query(query, [requestBody]);
    //await this.client.end();
    return res.rows[0].id;
  }

  async logError(error) {
    if(typeof error != 'string') {
      error = JSON.stringify(error);
    }
    const query = 'insert into findybot.errorlog ("error") values($1::varchar) returning id;';
    const res = await this.client.query(query, [error]);
    await this.client.end();
    return res.rows[0].id;
  }

  async logCommand(command, datain, dataout) {
    const query = 'insert into findybot.commands ("command", "datain", "dataout") values($1::varchar, $2::varchar, $3::varchar) returning id;';
    const res = await this.client.query(query, [command, datain, dataout]);
    await this.client.end();
    return res.rows[0].id;
  }
}

