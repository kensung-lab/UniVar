import pymongo
from interfaces.database import Database

class MongoDB(Database):
    MONGO_DB_VARIANTS_COLLECTION_NAME = 'variants'
    _engine = None

    def __init__(self, url, timeout, app_name):
        self.init_database(url, timeout, app_name)

    def init_database(self, url, timeout, app_name):
        self._engine = pymongo.MongoClient(url, timeoutMS=timeout, socketTimeoutMS=timeout, connectTimeoutMS=timeout, serverSelectionTimeoutMS=timeout, appname=app_name)

    def insert_many(self, database, table, data):
        return self._getCollection(database, table).insert_many(data)
    
    def insert_one(self, database, table, data):
        return self._getCollection(database, table).insert_one(data)
    
    def update_one(self, database, table, condition, data):
        return self._getCollection(database, table).update_one(condition, data)
    
    def update_many(self, database, table, condition, data):
        return self._getCollection(database, table).update_many(condition, data)
    
    def delete_one(self, database, table, condition):
        return self._getCollection(database, table).delete_one(condition)
    
    def delete_many(self, database, table, condition):
        return self._getCollection(database, table).delete_many(condition)
    
    def replace_one(self, database, table, condition, data):
        return self._getCollection(database, table).replace_one(condition, data, True)

    def create_index(self, database, table, index, name, collation=None, partialFilterExpression=None):
        if collation and partialFilterExpression:
            self._getCollection(database, table).create_index(index, collation=collation, partialFilterExpression=partialFilterExpression, name=name)
        elif collation:
            self._getCollection(database, table).create_index(index, collation=collation, name=name)
        elif partialFilterExpression:
            self._getCollection(database, table).create_index(index, partialFilterExpression=partialFilterExpression, name=name)
        else:
            self._getCollection(database, table).create_index(index, name=name)
    
    def find_variant(self, database, condition):
        return self._getCollection(database, self.MONGO_DB_VARIANTS_COLLECTION_NAME).find(condition)

    def find(self, database, table, condition):
        return self._getCollection(database, table).find(condition)

    def find_one(self, database, table, condition):
        return self._getCollection(database, table).find_one(condition)
    
    def find_one_variant(self, database, condition):
        return self._getCollection(database, self.MONGO_DB_VARIANTS_COLLECTION_NAME).find_one(condition)

    def distinct(self, database, table, condition):
        return self._getCollection(database, table).distinct(condition)
    
    def grant_access(self, database, user, access):
        return self._engine[database].command("grantRolesToUser", user, roles=access)

    def drop_table(self, database, table):
        return self._getCollection(database, table).drop()

    def close_database(self):
        self._engine.close()

    def get_admin_database(self):
        return self._engine['admin']

    def _getCollection(self, database, table):
        return self._engine[database][table]