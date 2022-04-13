const { Pool } = require("pg");
import config from './config.json';
const db_config = config.database;

const ip_re = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const credentials = {
  user: db_config.user,
  host: db_config.host,
  database: db_config.database,
  password: db_config.password,
  port: db_config.port,
};

let pool = new Pool(credentials);

export async function get_ips() {
  const text = `SELECT * FROM addresses`;
  return pool.query(text);
}

export async function add_ip(ip: string) {
  if(ip == "127.0.0.1" || !ip_re.test(ip)) return;
  console.log(`saving to database: ${ip}`);

  const text = ` INSERT INTO addresses (ip) VALUES($1) ON CONFLICT (ip) DO NOTHING;`;
  const values = [ip];
  try {
    pool.query(text, values);
  } catch(e) {
    console.log("Failed to add IP")
    return 0;
  }
}

export async function get_object(objectid: string){

}

export async function has_object(objectid: string){
  
}

export async function add_object(objectid: string, object: string){
  
}