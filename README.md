# ee374
EE 374 Psets by Beining (Cathy) Zhou and Jack Liu

step 1: download postgresql, create a database on your computer called "marabu", then create a table called "addresses" in that database. add the IP addresses `[149.28.220.241, 149.28.204.235, 139.162.130.195]` to the table with the following SQL command: `INSERT INTO addresses (ip)
VALUES('149.28.220.241');`. These are the hardcoded initial addresses

create table objects (
object_id TEXT PRIMARY KEY,
object TEXT UNIQUE NOT NULL);

create table utxo (
blockid TEXT PRIMARY KEY,
txid TEXT NOT NULL,
index TEXT NOT NULL);

step 2: add `config.json` file in the src directory. The file should contain the following 
`
{
	"database": {
		"user": "postgres",
		"host": "localhost",
		"database": "marabu",
		"password": "your-password",
		"port": 5432
	}
}
`

step 3: `npm install`

step 4: `ts-node index.ts`
or 
`npm run watch`

The second command will restart everytime you make a change to the source code. Good for development.