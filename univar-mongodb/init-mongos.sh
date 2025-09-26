password=$(cat mongo-root-password)
backendpassword=$(cat mongo-univar-backend-password)

docker exec -it configsvr mongosh --port 27017 /init/init-configsvr.js
docker exec -it shard1 mongosh --port 27017 /init/init-shard1.js
docker exec -it shard2 mongosh --port 27017 /init/init-shard2.js
docker exec -it shard3 mongosh --port 27017 /init/init-shard3.js
docker exec -it shard4 mongosh --port 27017 /init/init-shard4.js
docker exec -it mongos mongosh --port 27017 --eval "db.getSiblingDB(\"admin\").createUser({ user: \"root\", pwd: \"$password\", roles: [{ role: \"root\", db: \"admin\" }]});"
docker exec -it mongos mongosh --port 27017 -u root -p $password --eval "db.getSiblingDB(\"admin\").createUser({ user: \"univar-backend\",  pwd: \"$backendpassword\", roles: [{ role: \"readWrite\", db: \"common\" }, { role: \"read\", db: \"gene\" }]});"
docker exec -it mongos mongosh --port 27017 -u root -p $password /init/init-mongos.js 