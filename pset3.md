## UTXO:

each object in a UTXO table: {txid: "abc", index: 1}


create_UTXO_table(blockid: string)

get_UTXO_table(blockid: string) : set

save_to_UTXO_table(blockid: string, utxo_set: set)


validate_UTXO(previd: string, txs: any)