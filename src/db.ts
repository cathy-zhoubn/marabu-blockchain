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
  const text = `SELECT * FROM objects WHERE object_id=$1;`;
  const values = [objectid];
  const result = await pool.query(text, values);
  try{
    return result.rows[0]["object"]
  } catch(e) {
    console.log("Failed to get object")
    return 0;
  }
}

export async function has_object(objectid: string){
  const text = `SELECT COUNT(*) FROM objects WHERE object_id=$1;`;
  const values = [objectid];
  const result = await pool.query(text, values);
  const count : number = +result.rows[0]["count"];
  return count > 0
}

export async function add_object(objectid: string, object: string){
  const text = ` INSERT INTO objects (object_id, object) VALUES($1, $2) ON CONFLICT (object_id) DO NOTHING;`;
  const values = [objectid, object];
  try {
    pool.query(text, values);
  } catch(e) {
    console.log("Failed to add IP")
    return 0;
  }
}

export async function save_to_UTXO_table(blockid: string, utxo_set: Set<any>){
  utxo_set.forEach(async (outpoint) => {
    if(!await has_UTXO_lable(blockid, outpoint.txid, outpoint.index)){
      const text = ` INSERT INTO utxo (blockid, txid, index) VALUES($1, $2, $3);`;
      const values = [blockid, outpoint.txid, outpoint.index];
      await pool.query(text, values);
    }
  });
}

export async function has_UTXO_lable(blockid: string, txid: string, index: number){
  const text = `SELECT COUNT(*) FROM utxo WHERE blockid=$1 AND txid=$2 AND index=$3;`;
  const values = [blockid, txid, index];
  const result = await pool.query(text, values);
  const count : number = +result.rows[0]["count"];
  return count > 0
}


export async function get_UTXO_table(blockid: string) { //return a set
  const text = `SELECT * FROM utxo WHERE blockid=$1;`;
  const values = [blockid];
  const result = await pool.query(text, values);
  const set = new Set()
  for (let row of result.rows){
    set.add({"txid": row["txid"], "index": row["index"]})
  }
  return set;
}

const set = new Set()
// set.add({"txid": "1", "index": 1})
// set.add({"txid": "2", "index": 2})
// save_to_UTXO_table("1", set)

// has_UTXO_lable("1", "1", 1).then((set) => {
//   console.log(set)
// })

// get_UTXO_table("1").then((set) => {
//   console.log(set)
// })