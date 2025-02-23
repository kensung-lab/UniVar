echo "Building univar-backend application"
pnpm run build

echo "Building univar-backend docker image"
docker build -t bab-backend:demo .

echo "Deploying"
docker compose up -d