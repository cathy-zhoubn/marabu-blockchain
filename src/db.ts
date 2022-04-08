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

export async function IP_in_db(ip: string) {
  const text = `SELECT * FROM addresses WHERE ip = $1`;
  const values = [ip];
  return pool.query(text, values);
}

export function timeout() {
  let time = 1000;
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(Date.now());
    }, time)
  });
}

export async function addIP(ip: string) {
  const text = ` INSERT INTO addresses (ip) VALUES($1)`;
  const values = [ip];
  try {
    let temp = pool.query(text, values);
    let time = await timeout();
    return temp;
  } catch(e) {
    console.log("Failed to add IP")
    return 0;
  }
}
