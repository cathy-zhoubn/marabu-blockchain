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

let pool = new Pool(credentials);

export async function getIPs() {
  const text = `SELECT * FROM addresses`;
  return pool.query(text);
}

export async function addIP(ip: string) {
  if(ip == "127.0.0.1" || ip == "localhost" || ip == "") return;

  const text = ` INSERT INTO addresses (ip) VALUES($1) ON CONFLICT (ip) DO NOTHING;`;
  const values = [ip];
  try {
    pool.query(text, values);
  } catch(e) {
    console.log("Failed to add IP")
    return 0;
  }
}
