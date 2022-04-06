const { Pool } = require("pg");
import config from './config.json';
const db_config = config.database;

const credentials = {
  user: db_config.user,
  host: db_config.host,
  database: db_config.database,
  password: db_config.password,
  port: db_config.port,
};

const pool = new Pool(credentials);

async function poolDemo() {
  const now = await pool.query("SELECT NOW()");
  await pool.end();
  return now;
}

export async function getIPs() {
  const text = `SELECT * FROM addresses`;
  return pool.query(text);
}

export async function addIP(ip: string) {
  const text = `
	INSERT INTO addresses (ip)
	VALUES($1)
	`;
  const values = [ip];
  return pool.query(text, values);
}
