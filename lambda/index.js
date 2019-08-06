exports.handler = async (event) => {
    const { Client } = require('pg');  //  Needs the nodePostgres Lambda Layer.
    const client = new Client();
    await client.connect();
    
    const id = 1;
    const res = await client.query(`
      select *
      from db.findybot.commands
      where 
        id=$1::integer
      limit 1;
    `, [ id ]);
    await client.end();  
  
    const response = {
        statusCode: 200,
        body: res.rows[0],
    };
    return response;
  };