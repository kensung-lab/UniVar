rs.initiate({
  _id: "shard1ReplSet",
  members: [{ _id: 0, host: "shard1:27017" }],
});
