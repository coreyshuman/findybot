# Findybot Postgres Database Hosted on AWS RDS

# RDS Database Setup

1. Log into AWS
1. Services > Amazon RDS
1. Create database
1. Select PostgeSQL, Free tier
1. Settings
  - Identifier: findybot-db-instance
  - Enter a master username and password. Record these somewhere safe (password manager)
  - DB instance size: use default (db.t2.micro)
  - Storage: use default (general purpose SSD, 20 GiB, allow autoscaling, maximum threshold 1000)
  - Connectivity: create new VPC, create new subnet group, publicly accessible yes (for testing), Create new security group (findybot-security), availability zone no preference, use default port
    - security group failed?
  - Additional Configuration
    - Initial database name: findybot
    - DB parameter group: use default
    - IAM db authentication: disabled
    - Backup: create backups, 30 day retention, backup window no preference
    - Performance Insights: enable, 7 day retention
    - Monitor: disabled enhanced monitorting
    - Log exports: export postgresql log and upgrade log
    - IAM role: ?
    - Maintenance: enable auto minor upgrade
    - Maintenance window: no preference
    - Deletion protection: disabled
1. Create database
1. Click to open `findybot-db-instance`
1. Connectivity & security
  - Security group > Inboud > Add Rule
  - PostgreSQL, My IP, description
  - Save


# Setup Database and Tables
1. Connect to RDS Postrgres instance with Postgres database tool of choice 
  - DBeaver
  - Postico
2. Create secure password in `SetupDatabase.sql`
3. Execute `SetupDatabase.sql`

