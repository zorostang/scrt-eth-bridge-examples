import { DB_HOST, DB_PORT, DB_DATABASE } from "./config";
import { connect } from 'mongoose';

const dbConnection = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;
const connection = connect(dbConnection);

export default  connection