rs.initiate({
  _id: "shard2ReplSet",
  members: [{ _id: 0, host: "shard2:27017" }],
});
