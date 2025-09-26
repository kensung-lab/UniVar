rs.initiate({
  _id: "shard3ReplSet",
  members: [{ _id: 0, host: "shard3:27017" }],
});
