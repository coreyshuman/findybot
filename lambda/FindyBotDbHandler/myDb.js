const { Client } = require('pg');  //  Needs the nodePostgres Lambda Layer.

module.exports = class Database {
    constructor() {
        this.client = new Client();
    }

    async connect() {
        await this.client.connect();
        return this.client;
    }

    async query(_query, parameters) {
        return this.client.query(_query, parameters);
    }

    async findItem(itemName) {
        const query = "select name, quantity, row, col from findybot.items where namekey = $1::varchar;";
        const res = await this.client.query(query, [itemName]);

        if (res.rowCount) {
            return res.rows;
        } else {
            return null;
        }
    }

    async findConsumedBoxes() {
        const query = "select distinct row,col from findybot.items;";
        const res = await this.client.query(query);

        if (res.rowCount) {
            return res.rows;
        } else {
            return null;
        }
    }

    async insertItem(nameKey, itemName, itemCount, useSmallBox, row, col) {
        const query = 'insert into findybot.items ("namekey", "name", "quantity", "row", "col", "issmallbox")'
            + 'values($1::varchar, $2::varchar, $3::integer, $4::integer, $5::integer, $6) returning namekey;';
        const res = await this.client.query(query, [nameKey, itemName, itemCount, row, col, useSmallBox]);
        //await this.client.end();
        return res.rows[0].namekey;
    }

    /* Insert tags without creating duplicates. 
      values are mapped as:
        ('tape_measure', 'aa'), ('tape_measure', 'battery'), ('tape_measure', 'power')
    */
    async insertTags(nameKey, tags) {
        const query = 
`with data(namekey, tag) as (
values
    ${tags.map((tag, index) => `($1::varchar, $${index+2}::varchar)`).join(',')}
)
insert into findybot.tags(namekey, tag)
select d.namekey, d.tag
from data d
where not exists (
    select 1 from findybot.tags t2
    where t2.namekey = d.namekey and t2.tag = d.tag
);`
        const res = await this.client.query(query, [nameKey].concat(tags));

        return res.rowCount;

    }

    async logQuery(requestBody) {
        const query = 'insert into findybot.httprequests ("httprequestbody") values($1::varchar) returning id;';
        const res = await this.client.query(query, [requestBody]);
        //await this.client.end();
        return res.rows[0].id;
    }

    async logError(error) {
        error = error.message ? error.message : error;
        const query = 'insert into findybot.errorlog ("error") values($1::varchar) returning id;';
        const res = await this.client.query(query, [error]);
        //await this.client.end();
        return res.rows[0].id;
    }

    async logCommand(command, datain, dataout) {
        const query = 'insert into findybot.commands ("command", "datain", "dataout") values($1::varchar, $2::varchar, $3::varchar) returning id;';
        const res = await this.client.query(query, [command, datain, dataout]);
        await this.client.end();
        return res.rows[0].id;
    }
}

