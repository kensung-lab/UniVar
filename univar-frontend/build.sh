echo "Building univar-front application"
pnpm run build:development

echo "Building univar-frontend docker image"
docker build -t univar-frontend:demo .

echo "Saving Image"
docker save -o univar-frontend.tar univar-frontend:demo

echo "Completed building univar-front image"