-- Creates a new DB
CREATE DATABASE URL_DB;

-- Enters the DB
\c URL_DB;

-- Creates the URL Table
create table URL_TABLE (
    id bigserial primary key,
    url_string varchar(2048) not null,
    permanent boolean not null,
    expiry_date timestamp,
    custom_name varchar(20) not null,
);