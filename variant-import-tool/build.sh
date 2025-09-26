echo "Building variant-import-tool-env docker image"
docker build -t variant-import-tool-env:1.0.1 .

echo "Saving Image"
docker save -o variant-import-tool-env.tar variant-import-tool-env:1.0.1

echo "Complete Building variant-import-tool"