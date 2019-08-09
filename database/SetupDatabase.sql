create user findyuser with password 'abc';
grant findyuser to current_user;
create schema findybot authorization findyuser;

CREATE TABLE findybot.items (
	"namekey" 		varchar(50) not null,
	"name" 			varchar(50) NOT NULL,
	"quantity" 		integer 	NOT NULL DEFAULT 0,
	"row" 			integer		not null,
	"col"			integer		not null,
	"issmallbox"	boolean			not null default true,
	"datecreated" 	timestamp with time zone default current_timestamp,
	"lastupdated" 	timestamp with time zone null,
	constraint namekey_key primary key(namekey)
);

create table findybot.tags (
	"id"		integer		not null generated by default as identity,
	"namekey"	varchar(50)	not null,
	"tag"		varchar(50) not null,
	constraint tags_id_key primary key(id),
	constraint fk_tag_item foreign key(namekey) references findybot.items (namekey)
);

create table findybot.commands (
	"id"			integer			not null generated by default as identity,
	"command"		varchar(50)		not null,
	"datain"		varchar(255)	not null,
	"dataout"		varchar(255)	not null,
	"datecreated" 	timestamp with time zone default current_timestamp,
	constraint commands_id_key primary key(id)
);

create table findybot.httprequests (
	"id"				integer			not null generated by default as identity,
	"httprequestbody"	varchar			null,
	"datecreated" 		timestamp with time zone default current_timestamp,
	constraint httprequests_id_key primary key(id)
);

create table findybot.errorlog (
	"id"				integer			not null generated by default as identity,
	"error"				varchar			null,
	"datecreated" 		timestamp with time zone default current_timestamp,
	constraint errorlog_id_key primary key(id)
);

GRANT select, insert, update ON ALL TABLES IN SCHEMA findybot TO findyuser;
GRANT usage, select ON ALL SEQUENCES IN SCHEMA findybot TO findyuser;