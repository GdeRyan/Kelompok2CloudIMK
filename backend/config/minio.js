const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false, 
    accessKey: 'cloudklp2_admin',
    secretKey: '123456789'
});
module.exports = minioClient;