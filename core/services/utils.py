import uuid


def generate_link(cypher, user1_uuid: uuid.UUID):
    encrypted_uuid = cypher.encrypt(str(user1_uuid).encode())
    return f'http://127.0.0.1:3000/c/activation_link/{encrypted_uuid.decode()}/'

