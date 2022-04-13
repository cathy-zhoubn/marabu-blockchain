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
  const text = `SELECT * FROM objects WHERE object_id = '($1)';`;
  const result = pool.query(text, objectid);
  return result.rows[0]["object"]
}

export async function has_object(objectid: string){
  const text = `SELECT COUNT(*) FROM objects WHERE object_id = '($1)';`;
  const result = pool.query(text, objectid);
  return result.rows[0]["count"]
  
}

export async function add_object(objectid: string, object: string){
  const text = ` INSERT INTO objects (object_id, object) VALUES($1, $2);`;
  const values = [objectid, object];
  try {
    pool.query(text, values);
  } catch(e) {
    console.log("Failed to add IP")
    return 0;
  }
}