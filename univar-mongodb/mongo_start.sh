mkdir -p mongo-sharded/configsvr-data
mkdir -p mongo-sharded/shard1-data
mkdir -p mongo-sharded/shard2-data
mkdir -p mongo-sharded/shard3-data
mkdir -p mongo-sharded/shard4-data
mkdir -p mongo-sharded/mongos
docker network create --driver bridge mongos_internal || true
UID_GID="$(id -u):$(id -g)" docker compose up --build -d