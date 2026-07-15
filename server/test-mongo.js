const mongoose = require('mongoose');

const uri1 = 'mongodb://lms:lms123@ac-liecagk-shard-00-00.sn1uajz.mongodb.net:27017,ac-liecagk-shard-00-01.sn1uajz.mongodb.net:27017,ac-liecagk-shard-00-02.sn1uajz.mongodb.net:27017/?ssl=true&replicaSet=atlas-u8b0ie-shard-0&authSource=admin&appName=Cluster0';

const uri_tls_bypass = uri1 + '&tlsInsecure=true';

async function testConnection() {
  console.log('Testing URI with TLS bypass...');
  try {
    await mongoose.connect(uri_tls_bypass, { serverSelectionTimeoutMS: 5000 });
    console.log('TLS BYPASS SUCCESS!');
    await mongoose.disconnect();
  } catch (err) {
    console.log('TLS BYPASS FAILED:', err.message);
  }
  process.exit(0);
}

testConnection();
