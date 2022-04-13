
## Object:
func hash_object(object)
- function to hash an object into an objectid
- fast-sha256 of canonical JSON representation (convert Uint8 to hex strings)
- test by Genesis block and blockid


if (recieve ihaveobject from peer):
    if object not in database:
        send_getobject(object, peer)
    
if (receive object from peer):
    receive_object(object)
    for all peers:
        send_ihaveobject(object, peer)

if (receive getobject from peer):
    send_object(object, peer)



func send_getobject(object, peer)
    send getobject message

func send_ihaveobject(object, peer)
    send ihaveobject message

func receive_object(object)
    store object in database

func send_object(object, peer):
    if object in database:
        delete the object instance from database
        send object message to peer


## Transaction:
