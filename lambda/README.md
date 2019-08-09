# Lambda Setup
1. Choose "US East (N. Virignia)" (required for Alexa)
1. Services > Lambda
1. Create Lambda Function
1. Author From Scratch
  - Function name: findybot
  - Runtime: Node.js 10.x
  - Permissions: create new role with basic permissions
1. Create

# Upload Code
1. Generate zip file: `npm run predeploy`
1. Upload to Lambda: Function Code > Code Entry Type > Upload Zip
1. Save
1. Setup Enviornment variables

| Key | Value | 
| :---: | :---: | 
| PGDATABASE | findybot |
| PGHOST | findybot-db-instance.**************.us-east-2.rds.amazonaws.com |
| PGPASSWORD | abc |
| PGPORT | 5432 |
| PGUSER | findyuser |