const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'cloudklp2_admin',
    secretKey: process.env.MINIO_SECRET_KEY || '123456789'
});

module.exports = minioClient;