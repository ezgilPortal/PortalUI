# ezgil-web-ui
   
## Project setup
```
yarn install 
```

### Working in the development environment
```
yarn start:dev
```

### Working in the production environment
```
yarn start:prod
```

### Compiles and minifies for production
```
yarn build:prod
```

### Build with docker prod
```
docker build --pull --rm -f "Dockerfile" -t ezgilwebui .
```

### Build with docker prod for M1 Chip
```
docker build --pull --rm --platform linux/amd64 -f "Dockerfile" -t ezgilwebui .
```

### Local run with docker
```
docker run --rm -it -p 80:3000 ezgilwebui
```

### Run with docker for Docker Hub
```
docker run --rm -it -p 80:3000 alicanblnr/ezgilwebui
```
