// Branislav Hozza
const {
  DB_USER='root',
  DB_PASSWORD='123456',
  DB_HOST='localhost',
  DB_PORT='27017',
  DB_NAME='zadanie_db',
} = process.env;

export default {
  url: `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`,
};
