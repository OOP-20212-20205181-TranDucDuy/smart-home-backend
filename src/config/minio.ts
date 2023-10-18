export const config = {
    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
    MINIO_PORT:  parseInt(process.env.MINIO_PORT) || 9000,
    MINIO_ACCESSKEY: process.env.MINIO_ACCESSKEY ||'4mZuu8K0zCVRneN9VbYR',
    MINIO_SECRETKEY: process.env.MINIO_SECRETKEY || 'SMRvM6snbpZ9otyEkZplDrEZFlmxHtHmg2Fy0Js5',
    MINIO_BUCKET: process.env.MINIO_BUCKET || 'test'
  }