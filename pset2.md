
## Object:
func hash_object(object)
- function to hash an object into an objectid
- fast-sha256 of canonical JSON representation (convert Uint8 to hex strings)
- test by Genesis block and blockid

export default class object_receiver {
  public received_new_object?: (object: any) => void

  public receive_object(object): void {
        if(object not in db){
            store object in database
            this.gotNewObject(object)
        }

  }
}

if (recieve ihaveobject from peer):
    if object in database:
        send_getobject(object, peer)
    
if (receive object from peer):
    object_receiver.receive_object(object)

if (receive getobject from peer):
    send_object(object, peer)

func send_getobject(object, peer)
    send getobject message

func send_ihaveobject(object, peer)
    send ihaveobject message


func send_object(object, peer):
    if object in database:
        delete the object instance from database
        send object message to peer


## Transaction:
