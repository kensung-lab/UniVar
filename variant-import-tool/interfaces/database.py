from abc import ABC, abstractmethod


class Database(ABC):
    _engine = None

    @abstractmethod
    def init_database(self, url, timeout, app_name):
        pass

    @abstractmethod
    def insert_many(self, database, table, data):
        pass

    @abstractmethod
    def insert_one(self, database, table, data):
        pass

    @abstractmethod
    def update_one(self, database, table, condition, data):
        pass

    @abstractmethod
    def update_many(self, database, table, condition, data):
        pass

    @abstractmethod
    def replace_one(self, database, table, condition, data):
        pass

    @abstractmethod
    def delete_one(self, database, table, condition):
        pass

    @abstractmethod
    def delete_many(self, database, table, condition):
        pass

    @abstractmethod
    def create_index(self, database, table, index, name, collation=None, partialFilterExpression=None):
        pass

    @abstractmethod
    def find(self, database, table, condition):
        pass

    @abstractmethod
    def find_one(self, database, table, condition):
        pass

    @abstractmethod
    def distinct(self, database, table, condition):
        pass

    @abstractmethod
    def grant_access(self, database, user, access):
        pass

    @abstractmethod
    def drop_table(self, database, table):
        pass

    @abstractmethod
    def close_database(self):
        pass

    @abstractmethod
    def get_admin_database(self):
        pass